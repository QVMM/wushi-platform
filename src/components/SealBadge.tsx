interface Props {
  text: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-11 h-11 text-lg',
  lg: 'w-14 h-14 text-2xl',
}

export function SealBadge({ text, size = 'md', className = '' }: Props) {
  return (
    <div
      className={`seal-stamp inline-flex items-center justify-center rounded-sm rotate-[-6deg] font-serif font-semibold ${sizes[size]} ${className}`}
      aria-hidden
    >
      {text}
    </div>
  )
}
