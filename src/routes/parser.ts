import { Runtype } from 'runtypes'

import { Result } from 'utils'

export type DecodeResult<T> = Result<T, string>

export const decode = <T>(decoder: Runtype<T>, raw: unknown, msg?: string): DecodeResult<T> => {
  try {
    const parsed = decoder.check(raw)

    return Result.ok(parsed)
  } catch (e) {
    return Result.err(msg || 'Invalid data')
  }
}
