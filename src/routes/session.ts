import { Request } from 'express'
import { String } from 'runtypes'

import { initAdminSession, getAdminFromSession } from 'db/sessions'
import { isUUID } from 'utils'
import { Result, err, ResultAsync } from 'neverthrow'
import { decode } from 'routes/parser'

import { Admin, UUID } from 'db/types'
import * as Errors from 'errors'

type RouteError = Errors.RouteError

interface NewSessionInfo {
  sessionToken: UUID
  admin: Admin
}

export const getAuthToken = (
  authHeader: string
): Result<string, RouteError> => {
  const uuidDecoder = String.withConstraint((s) => isUUID(s))

  return decode(uuidDecoder, authHeader).mapErr(() => Errors.invalidToken())
}

export class SessionManager {
  private req: Request

  constructor(req: Request) {
    this.req = req
  }

  private getSessionToken = (): Result<string, RouteError> => {
    const authHeader = this.req.get('Authorization')

    if (!authHeader) {
      return err(Errors.missingHeader())
    }

    return getAuthToken(authHeader)
  }

  public getSessionUser = (): ResultAsync<Admin, RouteError> =>
    this.getSessionToken().asyncAndThen(getAdminFromSession)

  public createSession = (
    admin: Admin
  ): ResultAsync<NewSessionInfo, RouteError> =>
    initAdminSession(admin).map((sessionToken) => ({
      sessionToken,
      admin, 
    }))
}
