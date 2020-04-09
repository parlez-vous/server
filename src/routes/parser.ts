import { Runtype } from 'runtypes'

import { Result, ok, err } from 'neverthrow'

export namespace DecodeResult {
  export const pass = <T>(data: T): DecodeResult<T> => ok(data)
}

export type DecodeResult<T> = Result<T, string>

export const decode = <T>(
  decoder: Runtype<T>,
  raw: unknown,
  msg?: string
): DecodeResult<T> => {
  try {
    const parsed = decoder.check(raw)

    return ok(parsed)
  } catch (e) {
    return err(msg || 'Invalid data')
  }
}
