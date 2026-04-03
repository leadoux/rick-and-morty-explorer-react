import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'

type AppButtonProps = PropsWithChildren<{
  to?: string
  variant?: 'primary' | 'secondary'
}> &
  ButtonHTMLAttributes<HTMLButtonElement>

export default function AppButton({ to, children, className, variant = 'primary', ...props }: AppButtonProps) {
  const classes = `button ${variant === 'secondary' ? 'secondary' : ''} ${className ?? ''}`.trim()

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}
