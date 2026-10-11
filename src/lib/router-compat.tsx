// Thin adapter so the original TryOnix pages (written for react-router-dom)
// run unchanged on TanStack Router.
import {
  Link as TLink,
  Outlet as TOutlet,
  useNavigate as useTNavigate,
  useParams as useTParams,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef, type AnchorHTMLAttributes, type ReactNode } from "react";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: string; replace?: boolean | undefined };

export function Link({ to, children, replace, ...rest }: LinkProps) {
  if (to.includes("#")) {
    return (
      <a href={to} {...rest}>
        {children}
      </a>
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <TLink to={to as any} replace={replace} {...(rest as any)}>
      {children}
    </TLink>
  );
}

type NavLinkProps = Omit<LinkProps, "className"> & {
  end?: boolean | undefined;
  className?: string | ((s: { isActive: boolean }) => string);
};

export function NavLink({ to, end, className, ...rest }: NavLinkProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = end ? pathname === to || pathname === to + "/" : pathname === to || pathname.startsWith(to + "/");
  const cls = typeof className === "function" ? className({ isActive }) : className;
  return <Link to={to} className={cls} aria-current={isActive ? "page" : undefined} {...rest} />;
}

export function useNavigate() {
  const navigate = useTNavigate();
  return (to: string | number, opts?: { replace?: boolean }) => {
    if (typeof to === "number") return window.history.go(to);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return navigate({ to: to as any, ...(opts?.replace ? { replace: true } : {}) });
  };
}

export function useParams<T extends Record<string, string | undefined>>(): Partial<T> {
  return (useTParams as any)({ strict: false }) as Partial<T>;
}

export function useLocation() {
  const loc = useRouterState({ select: (s) => s.location });
  const search = loc.search as Record<string, unknown>;
  const redirect = typeof search["redirect"] === "string" && search["redirect"].startsWith("/") ? search["redirect"] : undefined;
  return {
    pathname: loc.pathname,
    hash: loc.hash,
    state: redirect ? { from: { pathname: redirect } } : null,
  };
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    navigate(to, { replace: !!replace });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export function Outlet(): ReactNode {
  return <TOutlet />;
}
