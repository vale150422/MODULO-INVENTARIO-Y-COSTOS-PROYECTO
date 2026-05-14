import { motion } from 'framer-motion'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-200',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-colors duration-200 focus:outline-none focus:ring-2
        focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : (
        Icon && <Icon size={20} />
      )}
      {children}
    </motion.button>
  )
}
