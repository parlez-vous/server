import { Request } from 'express'
import { String } from 'runtypes'

import { initAdminSession, getAdminFromSession } from 'db/sessions'
import { isUUID } from 'utils'
import { Result, err } from 'neverthrow'
import { decode } from 'routes/parser'

import { Admins, Uuid } from 'db/types'
import { RouteError } from 'routes/types'


export const getAuthToken = (authHeader: string): Result<string, RouteError> => {
  const uuidDecoder = String.withConstraint(
    s => isUUID(s)
  )

  return decode(uuidDecoder, authHeader)
    .mapErr(() => RouteError.InvalidToken)
}


export class SessionManager {
  private req: Request

  constructor(req: Request) {
    this.req = req
  }

  private getSessionToken = (): Result<string, RouteError> => {
    const authHeader = this.req.get('Authorization')

    if (!authHeader) {
      return err(RouteError.MissingHeader)
    }

    return getAuthToken(authHeader)
  }

  getSessionUser = async (): Promise<Result<Admins.WithoutPassword, RouteError>> => {
    const result = await this
      .getSessionToken()
      .asyncMap(async (token) => {
        const userResult = await getAdminFromSession(token)

        return userResult
          .map(Admins.removePassword)
      })

    return result.andThen(r => r)
  }

  createSession = async (user: Admins.Schema): Promise<Result<Uuid, RouteError>> => {
    return initAdminSession(user)
  }
}