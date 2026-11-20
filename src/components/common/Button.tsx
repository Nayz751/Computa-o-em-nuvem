import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cx } from '../../utils/cx';

type Variant = 'dark' | 'accent' | 'outline' | 'danger' | 'ghost';
type Size = 'md' | 'sm';

interface Shared { variant?: Variant; size?: Size; block?: boolean }

const classes = ({ variant = 'dark', size = 'md', block }: Shared, extra?: string) =>
  cx('btn', `btn--${variant}`, size === 'sm' && 'btn--sm', block && 'btn--block', extra);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Shared { loading?: boolean }

export function Button({ variant, size, block, loading, disabled, className, type = 'button', children, ...rest }: ButtonProps) {
  return (
    <button type={type} className={classes({ variant, size, block }, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <span className="spinner spinner--inline" aria-hidden="true" />}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends LinkProps, Shared { children: ReactNode }

export function ButtonLink({ variant, size, block, className, children, ...rest }: ButtonLinkProps) {
  return <Link className={classes({ variant, size, block }, className)} {...rest}>{children}</Link>;
}
