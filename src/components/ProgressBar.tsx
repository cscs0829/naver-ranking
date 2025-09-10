'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

export default function ProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 })
  return (
    <motion.div style={{ scaleX }} className="fixed left-0 right-0 top-0 h-1 origin-left z-50 bg-gradient-to-r from-blue-500 to-purple-600" />
  )
}


