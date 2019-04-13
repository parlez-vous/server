import { Request } from 'express'
import { String } from 'runtypes'

import { initAdminSession } from 'db/sessions'
import { getAdminFromSession } from 'db/actions'
import { Result, isUUID } from 'utils'
import { decode } from 'routes/parser'

import { Admins, Uuid } from 'db/types'


export const getAuthToken = (authHeader: string): Result<string, AuthorizationError> => {
  const uuidDecoder = String.withConstraint(
    s => isUUID(s)
  )

  return decode(uuidDecoder, authHeader)
    .mapErr(() => AuthorizationError.InvalidToken)
}


export enum AuthorizationError {
  MissingHeader,
  InvalidToken,
}

export namespace AuthorizationError {
  export const toString = (e: AuthorizationError): string => {
    switch (e) {
      case AuthorizationError.InvalidToken: {
        return 'Invalid Token'
      }

      case AuthorizationError.MissingHeader: {
        return 'Missing `Authorization` header'
      }
    }
  }
}

export enum SessionError {
  InvalidSession,
}

export namespace SessionError {
  export const toString = (e: SessionError): string => {
    switch (e) {
      case SessionError.InvalidSession: {
        return 'Invalid Session'
      }
    }
  }
}

export class SessionManager {
  private req: Request

  constructor(req: Request) {
    this.req = req
  }

  private getSessionToken = (): Result<string, AuthorizationError> => {
    const authHeader = this.req.get('Authorization')

    if (!authHeader) {
      return Result.err(AuthorizationError.MissingHeader)
    }

    return getAuthToken(authHeader)
  }

  getSessionUser = (): Result<Promise<Result<Admins.WithoutPassword, SessionError>>, AuthorizationError> => {

    return this
      .getSessionToken()
      .mapOk(async (token) => {
        const userResult = await getAdminFromSession(token)

        return userResult
          .mapOk(Admins.removePassword)
          .mapErr(() => SessionError.InvalidSession)
      })
  }

  createSession = async (user: Admins.Schema): Promise<Result<Uuid, string>> => {
    return initAdminSession(user)
  }
}