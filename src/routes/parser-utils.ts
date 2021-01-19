import * as rt from 'runtypes'
import { isValidPath, isCuid } from 'utils'

export const postIdDecoder = (hostname: string) =>
  rt.String.withConstraint(
    (val) => val === 'root' || isValidPath(hostname, val) || isCuid(val)
  )

export const cuidDecoder = rt.String.withConstraint(isCuid)
