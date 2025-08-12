import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  // Base: 3D effect (raised) + press interaction
  'relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors transform-gpu disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-white shadow-[0_4px_0_rgba(0,0,0,0.12)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.2)] whitespace-nowrap',
  {
    variants: {
      variant: {
        default:
          'bg-brand-orange text-white hover:opacity-90 border-b-[3px] border-b-orange-700',
        outline:
          'bg-white text-brand-navy border border-brand-gray/40 hover:bg-brand-light border-b-[3px] border-b-brand-gray/60',
        ghost:
          'text-brand-navy hover:bg-brand-light border-b-[3px] border-b-brand-gray/40',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 py-1 text-xs',
        lg: 'h-10 px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    )
  }
)
Button.displayName = 'Button'
