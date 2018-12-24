import HashIds from 'hashids'

import { hashIdSalt } from './env'

export const hasher = new HashIds(hashIdSalt, 6)

export class Result<T, E> {
  private _ok: T | null
  private _err: E | null

  private constructor(value: T, error: E) {
    this._ok = value
    this._err = error
  }

  static ok = <T>(data: T): Result<T, null> => {
    return new Result(data, undefined)
  }

  static err = <E>(data: E): Result<null, E> => {
    return new Result(undefined, data)
  }

  isOk = (): boolean => typeof this._ok !== 'undefined'
  
  isErr = (): boolean => typeof this._err !== 'undefined'

  map = <U>(f: (t: T) => U): Result<U, E> => {
    if (this.isOk()) {
      const returnVal = f(this._ok)

      // some functions may return nothing
      // in which case we want to make sure we don't
      // assign 'undefined' to the _ok field
      // or we end up in a weird state
      // where the Result is neither an err or and ok
      return Result.ok(
        returnVal || null
      )
    }

    return Result.err(this._err)
  }

  mapErr = <A>(f: (e: E) => A): Result<T, A> => {
    if (this.isErr()) {
      // some functions may return nothing
      // in which case we want to make sure we don't
      // assign 'undefined' to the _ok field
      // or we end up in a weird state
      // where the Result is neither an err or and ok
      return Result.err(
        f(this._err) || null
      )
    }

    return Result.ok(this._ok)
  }

  unwrap = (): T => this._ok
}
