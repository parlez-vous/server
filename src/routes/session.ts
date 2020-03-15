import { Request } from 'express'
import { String } from 'runtypes'

import { initAdminSession, getAdminFromSession } from 'db/sessions'
import { isUUID } from 'utils'
import { Result, err, ok, chain3 } from 'neverthrow'
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
    return chain3(
      Promise.resolve(this.getSessionToken()),
      (token) => getAdminFromSession(token),
      async (admin) => ok(removePassword(admin))
    )
  }

  createSession = async (admin: Admin): Promise<Result<UUID, RouteError>> => {
    return initAdminSession(admin)
  }
}
