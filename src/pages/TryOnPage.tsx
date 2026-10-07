import { useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoreBySlug, getProductById, createTryOnSession, completeTryOnSession, failTryOnSession } from '../services/catalog';
import { getTryOnProvider, TryOnError } from '../services/tryOnProvider';
import { SmartImage } from '../components/SmartImage';
import { ArrowLeft, Upload, Download, RotateCcw, AlertCircle, Settings } from 'lucide-react';

type Step = 'upload' | 'processing' | 'result' | 'error';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function TryOnPage() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const store = slug ? getStoreBySlug(slug) : null;
  const product = productId ? getProductById(productId) : null;

  const [step, setStep] = useState<Step>('upload');
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [processingLabel, setProcessingLabel] = useState('Creating your look...');
  const [submitting, setSubmitting] = useState(false);
  const [errorDetail, setErrorDetail] = useState<{ title: string; message: string; isConfig: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const labelTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFile = useCallback((file: File) => {
    setFileError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Image is too large. Please use one under 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPersonImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const startProcessing = async () => {
    if (!personImage || !product || !store || submitting) return;
    setSubmitting(true);
    const session = createTryOnSession({
      productId: product.id,
      storeId: store.id,
      personImage,
      consent,
    });
    setSessionId(session.id);
    setStep('processing');

    // Cycle subtle loading labels
    const labels = ['Creating your look...', 'Almost there...', 'Putting it together...'];
    let labelIdx = 0;
    labelTimerRef.current = setInterval(() => {
      labelIdx = (labelIdx + 1) % labels.length;
      setProcessingLabel(labels[labelIdx]);
    }, 1800);

    try {
      const provider = getTryOnProvider();
      const result = await provider.tryOn({
        personImage,
        garmentImage: product.image,
        category: product.category,
      });
      if (labelTimerRef.current) clearInterval(labelTimerRef.current);
      completeTryOnSession(session.id, result.image);
      setResultImage(result.image);
      setStep('result');
    } catch (err) {
      if (labelTimerRef.current) clearInterval(labelTimerRef.current);
      failTryOnSession(session.id);

      if (err instanceof TryOnError && err.kind === 'not_configured') {
        setErrorDetail({
          title: 'Try-on is not configured yet.',
          message: 'The virtual try-on service needs to be set up before it can be used. Please configure the FASHN API key.',
          isConfig: true,
        });
      } else if (err instanceof TryOnError && err.kind === 'auth') {
        setErrorDetail({
          title: 'Something went wrong.',
          message: 'The try-on service API key is invalid or out of credits. Please check the configuration.',
          isConfig: true,
        });
      } else if (err instanceof TryOnError && err.kind === 'timeout') {
        setErrorDetail({
          title: 'This is taking longer than expected.',
          message: 'The try-on timed out. Please try again.',
          isConfig: false,
        });
      } else {
        const message = err instanceof Error ? err.message : 'Please try again.';
        setErrorDetail({
          title: 'Something went wrong.',
          message,
          isConfig: false,
        });
      }
      setStep('error');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setPersonImage(null);
    setResultImage(null);
    setSessionId(null);
    setConsent(false);
    setErrorDetail(null);
    setStep('upload');
  };

  if (!store || !product) {
    return (
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-3xl font-display font-semibold">Something went wrong</h1>
        <p className="mt-3 text-ink-muted">We couldn't find this product.</p>
        <Link to="/stores" className="mt-6 inline-flex btn-outline">
          <ArrowLeft size={18} /> Browse stores
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to={`/stores/${store.slug}/${product.id}`}
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back to product
      </Link>

      <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tighter2 mb-2">Try it on</h1>
      <p className="text-ink-muted mb-8">{product.name}</p>

      {/* Selected garment reference */}
      <div className="flex items-center gap-4 p-4 card mb-8">
        <SmartImage
          src={product.image}
          alt={product.name}
          aspectRatio="aspect-square"
          className="w-16 h-16 rounded shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{product.name}</p>
          <p className="text-xs text-ink-muted">{product.category}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Upload */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-display font-medium mb-4">Upload a photo of yourself</h2>
            <p className="text-ink-muted text-sm mb-6">
              Use a clear photo with your body visible. Standing straight, facing the camera works best.
            </p>

            {personImage ? (
              <div className="relative rounded-sm overflow-hidden border border-line mb-4">
                <img src={personImage} alt="Your uploaded photo" className="w-full max-h-[500px] object-contain bg-line/20" />
                <button
                  onClick={() => setPersonImage(null)}
                  className="absolute top-3 right-3 btn-ghost text-sm bg-white/90 backdrop-blur-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                className="border-2 border-dashed border-line rounded-sm p-12 text-center cursor-pointer hover:border-ink transition-colors mb-4"
              >
                <div className="inline-flex w-12 h-12 rounded-full border border-line items-center justify-center mb-4">
                  <Upload size={22} className="text-ink-muted" />
                </div>
                <p className="text-ink font-medium">Tap to upload a photo</p>
                <p className="text-sm text-ink-muted mt-1">JPG, PNG, or WebP — up to 10MB</p>
                <p className="text-xs text-ink-muted mt-2">or drag and drop here</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            {fileError && (
              <p className="text-sm text-error flex items-center gap-2 mb-4">
                <AlertCircle size={16} /> {fileError}
              </p>
            )}

            {/* Consent */}
            <label className="flex items-start gap-3 mt-6 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 accent-accent"
              />
              <span className="text-sm text-ink-muted leading-relaxed">
                I agree that my photo will be processed to create my look. My photo stays private and is never used to train any model.
              </span>
            </label>

            <button
              onClick={startProcessing}
              disabled={!personImage || !consent || submitting}
              className="btn-primary btn-lg w-full mt-6"
            >
              {submitting ? 'Starting...' : 'Continue'}
            </button>
          </motion.div>
        )}

        {/* STEP 2: Processing */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-16"
          >
            <div className="relative inline-block mb-8">
              {personImage && (
                <img
                  src={personImage}
                  alt="Your photo"
                  className="w-40 h-52 object-cover rounded-sm opacity-60 mx-auto"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-line border-t-accent rounded-full animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-medium text-ink mb-2">
              {processingLabel}
            </h2>
            <p className="text-ink-muted text-sm">This usually takes a few seconds.</p>
          </motion.div>
        )}

        {/* STEP 3: Result */}
        {step === 'result' && resultImage && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-3xl font-display font-semibold tracking-tighter2 mb-2">Here you go.</h2>
            <p className="text-ink-muted mb-6">This is how {product.name} looks on you.</p>

            <div className="rounded-sm overflow-hidden border border-line mb-6 bg-line/20">
              <img
                src={resultImage}
                alt={`You wearing ${product.name}`}
                className="w-full max-h-[600px] object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={reset} className="btn-outline flex-1">
                <RotateCcw size={18} /> Try another
              </button>
              <Link
                to={`/stores/${store.slug}/${product.id}`}
                className="btn-ghost flex-1"
              >
                Back to product
              </Link>
              <a
                href={resultImage}
                download={`tryonix-${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                className="btn-primary flex-1"
              >
                <Download size={18} /> Download
              </a>
            </div>
          </motion.div>
        )}

        {/* ERROR */}
        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <div className="inline-flex w-14 h-14 rounded-full bg-error/10 items-center justify-center mb-6">
              {errorDetail?.isConfig ? (
                <Settings size={28} className="text-ink-muted" />
              ) : (
                <AlertCircle size={28} className="text-error" />
              )}
            </div>
            <h2 className="text-2xl font-display font-medium text-ink mb-2">
              {errorDetail?.title ?? 'Something went wrong.'}
            </h2>
            <p className="text-ink-muted mb-6 max-w-sm mx-auto">
              {errorDetail?.message ?? 'Please try again.'}
            </p>
            <button onClick={reset} className="btn-primary">
              <RotateCcw size={18} /> Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
