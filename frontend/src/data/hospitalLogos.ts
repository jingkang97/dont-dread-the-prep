import skhLogo from '../assets/hospitals-logo/skh.png'
import ttshLogo from '../assets/hospitals-logo/ttsh.png'

/** Local logos keyed by hospitals.code. Missing codes fall back to the accent icon. */
export const HOSPITAL_LOGOS: Partial<Record<string, string>> = {
  ttsh: ttshLogo,
  skh: skhLogo,
}
