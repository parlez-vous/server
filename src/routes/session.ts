import { Request } from 'express'
import { String } from 'runtypes'

import { initAdminSession } from 'db/sessions'
import { getAdminFromSession } from 'db/actions'
import { Result, isUUID } from 'utils'
import { decode } from 'routes/parser'

import { Admins, DbError, Uuid } from 'db/types'


export const getAuthToken = (authHeader: string): Result<string, AuthError> => {
  const uuidDecoder = String.withConstraint(
    s => isUUID(s)
  )

  return decode(uuidDecoder, authHeader)
    .mapErr(() => AuthError.InvalidToken)
}


export enum AuthError {
  MissingHeader,
  InvalidToken,
  InvalidSession,
  Signup,
}

export class SessionManager {
  private req: Request

  constructor(req: Request) {
    this.req = req
  }

  private getSessionToken = (): Result<string, AuthError> => {
    const authHeader = this.req.get('Authorization')

    if (!authHeader) {
      return Result.err(AuthError.MissingHeader)
    }

    return getAuthToken(authHeader)
  }

  getSessionUser = async (): Promise<Result<Admins.WithoutPassword, AuthError>> => {
    const result = await this
      .getSessionToken()
      .asyncMap(async (token) => {
        const userResult = await getAdminFromSession(token)

        return userResult
          .mapOk(Admins.removePassword)
          .mapErr(() => AuthError.InvalidSession)
      })

    return result.extendOk(r => r)
  }

  createSession = async (user: Admins.Schema): Promise<Result<Uuid, DbError>> => {
    return initAdminSession(user)
  }
}