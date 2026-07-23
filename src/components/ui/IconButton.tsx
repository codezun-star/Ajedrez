import { ButtonHTMLAttributes, forwardRef } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

/** A square, accessible icon button used in the header and controls. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, active, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all
                  duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-brand-400/60 ${
                    active
                      ? 'bg-brand-500/20 text-brand-300 ring-1 ring-brand-400/40'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  } ${className ?? ''}`}
      {...rest}
    >
      {children}
    </button>
  );
});
