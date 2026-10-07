export interface TryOnRequest {
  personImage: string;
  garmentImage: string;
  category: string;
}

export interface TryOnResult {
  image: string;
}

export class TryOnError extends Error {
  constructor(
    message: string,
    public readonly kind: 'not_configured' | 'auth' | 'timeout' | 'runtime' | 'network',
  ) {
    super(message);
    this.name = 'TryOnError';
  }
}

export interface VirtualTryOnProvider {
  name: string;
  tryOn(req: TryOnRequest): Promise<TryOnResult>;
}

const FASHN_API_URL = import.meta.env.VITE_FASHN_API_URL || 'https://api.fashn.ai';
const FASHN_API_KEY = import.meta.env.VITE_FASHN_API_KEY || '';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 120_000;

interface FashnRunResponse {
  id: string;
  error: null | { name: string; message: string };
}

interface FashnStatusResponse {
  id: string;
  status: 'starting' | 'in_queue' | 'processing' | 'completed' | 'failed';
  output: string[] | null;
  error: null | { name: string; message: string };
}

/**
 * Real virtual try-on provider using the FASHN.ai API.
 *
 * Calls POST /v1/run with model_name "tryon-max", then polls
 * GET /v1/status/{id} until the prediction completes or fails.
 *
 * FASHN accepts both URLs and base64 data URIs as image inputs,
 * so the customer's uploaded photo (a data URI) and the product
 * image URL are passed directly.
 *
 * Returns the generated image as a base64 data URI (return_base64=true)
 * so it renders in an <img> tag with no CORS or CDN-expiry concerns.
 *
 * To use: set VITE_FASHN_API_KEY in .env. Get a key at
 * https://app.fashn.ai/api (requires credits).
 *
 * Production note: calling FASHN directly from the browser exposes
 * the API key. For production, proxy through a backend that injects
 * the key server-side. The VirtualTryOnProvider interface stays the
 * same — only the provider implementation changes.
 */
class FashnTryOnProvider implements VirtualTryOnProvider {
  name = 'fashn-tryon-max';

  async tryOn(req: TryOnRequest): Promise<TryOnResult> {
    if (!FASHN_API_KEY) {
      throw new TryOnError(
        'Virtual try-on is not configured. Set VITE_FASHN_API_KEY to enable it.',
        'not_configured',
      );
    }

    let runResponse: Response;
    try {
      runResponse = await fetch(`${FASHN_API_URL}/v1/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${FASHN_API_KEY}`,
        },
        body: JSON.stringify({
          model_name: 'tryon-max',
          inputs: {
            product_image: req.garmentImage,
            model_image: req.personImage,
            return_base64: true,
            output_format: 'jpeg',
            generation_mode: 'fast',
            resolution: '1k',
          },
        }),
      });
    } catch {
      throw new TryOnError('Could not reach the try-on service. Check your connection.', 'network');
    }

    if (runResponse.status === 401 || runResponse.status === 403) {
      throw new TryOnError('The try-on API key is invalid or has no credits.', 'auth');
    }

    if (!runResponse.ok) {
      let detail = `The try-on service returned an error (${runResponse.status}).`;
      try {
        const body = await runResponse.json();
        if (body?.message) detail = body.message;
      } catch {
        // ignore parse failure
      }
      throw new TryOnError(detail, 'runtime');
    }

    const runData = (await runResponse.json()) as FashnRunResponse;
    if (runData.error) {
      throw new TryOnError(runData.error.message, 'runtime');
    }

    const predictionId = runData.id;
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      let statusResponse: Response;
      try {
        statusResponse = await fetch(`${FASHN_API_URL}/v1/status/${predictionId}`, {
          headers: { Authorization: `Bearer ${FASHN_API_KEY}` },
        });
      } catch {
        throw new TryOnError('Lost connection to the try-on service while processing.', 'network');
      }

      if (!statusResponse.ok) {
        throw new TryOnError('The try-on service returned an unexpected response.', 'runtime');
      }

      const statusData = (await statusResponse.json()) as FashnStatusResponse;

      if (statusData.status === 'completed') {
        const output = statusData.output;
        if (output && output.length > 0 && output[0]) {
          return { image: output[0] };
        }
        throw new TryOnError('The try-on completed but no image was returned.', 'runtime');
      }

      if (statusData.status === 'failed') {
        const msg = statusData.error?.message ?? 'The try-on generation failed.';
        throw new TryOnError(msg, 'runtime');
      }
    }

    throw new TryOnError('The try-on is taking too long. Please try again.', 'timeout');
  }
}

let activeProvider: VirtualTryOnProvider = new FashnTryOnProvider();

export function getTryOnProvider(): VirtualTryOnProvider {
  return activeProvider;
}

export function setTryOnProvider(provider: VirtualTryOnProvider): void {
  activeProvider = provider;
}
