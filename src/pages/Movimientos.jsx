import { motion } from 'framer-motion'
import { MdAutoAwesome } from 'react-icons/md'

export default function Movimientos() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center py-20">
        <MdAutoAwesome size={64} className="text-primary-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Módulo de Movimientos</h1>
        <p className="text-slate-600 text-lg">En desarrollo - Próximamente disponible</p>
      </div>
    </motion.div>
  )
}
