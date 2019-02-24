import HashIds from 'hashids'

import { hashIdSalt } from './env'

import {
  Left,
  Right,
} from 'fp-ts/lib/Either'

export const hasher = new HashIds(hashIdSalt, 6)

// https://github.com/chriso/validator.js/blob/master/src/lib/isUUID.js
export const isUUID = (str: string): boolean => {
  // v4 uuids only
  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

  return uuidRegex.test(str)
}


export type Result<T, E>
  = Result.Ok<T, E>
  | Result.Err<T, E>

export namespace Result {
  export const ok = <T, E>(val: T): Result<T, E> => new Ok(val)

  export const err = <T, E>(err: E): Result<T, E> => new Err(err)

  export class Ok<T, E> extends Right<E, T> {
    constructor(val: T) {
      super(val)
    }
  
    isOk = (): this is Ok<T, E> => {
      return this.isRight()
    }
  
    isErr = (): this is Err<T, E> => {
      return this.isLeft()
    }

    mapOk = <U>(f: (t: T) => U): Result<U, E> => {
      const either = this.map(f)

      return either.isRight()
        ? new Ok(either.value)
        : new Err(either.value)
    }

    mapErr = <A>(f: (e: E) => A): Result<T, A> => {
      const either = this.mapLeft(f)

      return either.isRight()
        ? new Ok(either.value)
        : new Err(either.value)
    }

    unwrap = (): T => this.value
  }

  export class Err<T, E> extends Left<E, T> {
    constructor(err: E) {
      super(err)
    }

    isOk = (): boolean => {
      return this.isRight()
    }
  
    isErr = (): boolean => {
      return this.isLeft()
    }

    mapOk = <U>(f: (t: T) => U): Result<U, E> => {
      const either = this.map(f)

      return either.isRight()
        ? new Ok(either.value)
        : new Err(either.value)
    }

    mapErr = <A>(f: (e: E) => A): Result<T, A> => {
      const either = this.mapLeft(f)

      return either.isRight()
        ? new Ok(either.value)
        : new Err(either.value)
    }

    unwrap = (): E => this.value
  }
}
