export const easeOut = [0.22, 1, 0.36, 1] as const

export const fadeY = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: easeOut },
}
