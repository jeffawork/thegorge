'use client';
import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement> {
  icon?: React.ReactNode;
  error?: string;
  wrapperClassName?: string;
  variant?: 'default' | 'password';
}

const Input = forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
  (
    {
      icon,
      error,
      className,
      wrapperClassName,
      type = 'text',
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType =
      variant === 'password' ? (showPassword ? 'text' : 'password') : type;

    const baseStyles = cn(
      'box-border w-full h-[44px] flex items-center gap-2',
      'rounded-[32px] border bg-white text-sm text-black',
      'placeholder:text-muted-foreground outline-none transition-colors',
      'disabled:cursor-not-allowed disabled:opacity-50',
      error
        ? 'border-red-500 focus-visible:ring-red focus-visible:border-red'
        : 'border-[#C3BEBE] focus-visible:ring-ring/50 focus-visible:border-ring',
      className
    );

    return (
      <div className={cn('w-full space-y-1', wrapperClassName)}>
        <div className="relative flex items-center">
          {icon && (
            <span className="pointer-events-none absolute left-4 top-3">
              {icon}
            </span>
          )}

          {type === 'textarea' ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              className={cn(
                baseStyles,
                'min-h-[100px] resize-y py-2',
                icon ? 'pl-11' : 'px-[14px]'
              )}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <>
              <input
                ref={ref as React.Ref<HTMLInputElement>}
                type={inputType}
                className={cn(
                  baseStyles,
                  'h-[44px]',
                  icon ? 'pl-11' : 'px-[14px]',
                  variant === 'password' ? 'pr-11' : ''
                )}
                {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
              />

              {variant === 'password' && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {error && <p className="text-red text-sm">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
