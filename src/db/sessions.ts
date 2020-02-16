import * as uuidv4 from 'uuid/v4'

import sessiondb from 'resources/sessions'

import { Result, ok, err } from 'neverthrow'
import { DateTime } from 'luxon'
import { RouteError } from 'routes/types'
import { Admin, UUID } from './types'
import { getAdmin } from './actions'
import sessionDb from 'resources/sessions'


// remove any past sessions pertaining to user
export const initAdminSession = async (
  { id }: Admin
): Promise<Result<UUID, RouteError>> => {
  const uuid = uuidv4()

  sessiondb.set(uuid, {
    adminId: id,
    last_accessed_at: new Date()
  })

  return ok(uuid)
}

export const getAdminFromSession = async (
  sessionId: UUID,
): Promise<Result<Admin, RouteError>> => {
  const adminSession = sessionDb.get(sessionId)

  if (!adminSession) {
    return err(RouteError.NotFound)
  }

  const now = DateTime.local()
  const lastAccessed = DateTime.fromJSDate(adminSession.last_accessed_at)
  const sessionExpired = lastAccessed.diff(now).days > 7

  if (sessionExpired) {
    return err(RouteError.InvalidSession)
  }

  return getAdmin(adminSession.adminId)
}
