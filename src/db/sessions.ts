import db from './index'

import * as uuidv4 from 'uuid/v4'

import { AdminSessions, Admins, Uuid } from './types'
import { Result } from 'utils'

const cols = [
  AdminSessions.Table.cols.admin_user_id,
  AdminSessions.Table.cols.uuid,  
].join(', ')

// remove any past sessions pertaining to user
export const initAdminSession = async ({ id }: Admins.Schema): Promise<Result<Uuid, string>> => {
  const uuid = uuidv4()

  try {
    await db.raw(`
      INSERT INTO ${AdminSessions.Table.name} (${cols})
      VALUES (:adminId, :uuid)
      ON CONFLICT (${AdminSessions.Table.cols.admin_user_id}) DO UPDATE
        SET ${AdminSessions.Table.cols.uuid} = :uuid
      RETURNING *
    `, { adminId: id, uuid })

    return Result.ok(uuid)
  } catch (e) {
    return Result.err(
      'Error while upserting session for admin user'
    )
  }
}


export const destroyAdminSession = async (cookieId: Uuid): Promise<Result<null, string>> => {
  try {
    await db(AdminSessions.Table.name)
      .del()
      .where(AdminSessions.Table.cols.uuid, cookieId)

    return Result.ok(null)
  } catch (e) {
    return Result.err('Unable to destroy user session')
  }
}
