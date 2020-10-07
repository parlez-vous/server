import { Request } from 'express'
import { String } from 'runtypes'

import { initAdminSession, getAdminFromSession } from 'db/sessions'
import { isUUID } from 'utils'
import { Result, err, ResultAsync } from 'neverthrow'
import { decode } from 'routes/parser'

import { Admin, UUID } from 'db/types'
import { RouteError } from 'routes/types'
import { removePassword } from 'resources/admins'

interface NewSessionInfo {
  sessionToken: UUID
  admin: Admin.WithoutPassword
}

export const getAuthToken = (
  authHeader: string
): Result<string, RouteError> => {
  const uuidDecoder = String.withConstraint((s) => isUUID(s))

  return decode(uuidDecoder, authHeader).mapErr(() => RouteError.InvalidToken)
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

  getSessionUser = (): ResultAsync<Admin.WithoutPassword, RouteError> =>
    this.getSessionToken()
      .asyncAndThen(getAdminFromSession)
      .map(removePassword)

  createSession = (admin: Admin): ResultAsync<NewSessionInfo, RouteError> =>
    initAdminSession(admin)
      .map((sessionToken) => ({
        sessionToken,
        admin: removePassword(admin),
      }))
}

