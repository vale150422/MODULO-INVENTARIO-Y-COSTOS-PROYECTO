import { motion } from 'framer-motion'

export default function Badge({ children, variant = 'primary', size = 'md' }) {
  const variants = {
    primary: 'bg-primary-100 text-primary-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    slate: 'bg-slate-100 text-slate-800',
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center font-semibold rounded-full
        ${variants[variant]}
        ${sizes[size]}
      `}
    >
      {children}
    </motion.span>
  )
}
