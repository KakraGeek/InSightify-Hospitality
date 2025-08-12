import React from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const chipVariants = cva(
  'inline-flex items-center rounded-full border text-sm transition-colors whitespace-nowrap shadow-[0_2px_0_rgba(0,0,0,0.08)] active:translate-y-px active:shadow-[0_1px_0_rgba(0,0,0,0.12)]',
  {
    variants: {
      selected: {
        true: 'bg-slate-900 text-white border-slate-900 font-semibold',
        false: 'bg-white border-brand-gray/40 text-brand-navy hover:bg-brand-light',
      },
      size: {
        default: 'px-3 py-1',
        sm: 'px-2.5 py-1 text-xs',
        lg: 'px-3.5 py-1.5',
      },
    },
    defaultVariants: {
      selected: false,
      size: 'default',
    },
  }
)

export interface ChipLinkProps extends VariantProps<typeof chipVariants> {
  href: string
  children: React.ReactNode
  ariaCurrent?: 'page' | undefined
}

export function ChipLink({ href, children, selected, size, ariaCurrent }: ChipLinkProps) {
  return (
    <Link
      href={href}
      className={cn(chipVariants({ selected, size }))}
      aria-current={ariaCurrent}
    >
      {children}
    </Link>
  )
}
