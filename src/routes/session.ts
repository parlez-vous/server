import { Request } from 'express'
import { String } from 'runtypes'

import { initAdminSession, getAdminFromSession } from 'db/sessions'
import { isUUID } from 'utils'
import { Result, err } from 'neverthrow'
import { decode } from 'routes/parser'

import { Admin, UUID } from 'db/types'
import { RouteError } from 'routes/types'
import { removePassword } from 'resources/admins'


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

  getSessionUser = async (): Promise<Result<Admin.WithoutPassword, RouteError>> => {
    const result = await this
      .getSessionToken()
      .asyncMap(async (token) => {
        const userResult = await getAdminFromSession(token)

        return userResult
          .map(removePassword)
      })

    return result.andThen(r => r)
  }

  createSession = async (admin: Admin): Promise<Result<UUID, RouteError>> => {
    return initAdminSession(admin)
  }
}
