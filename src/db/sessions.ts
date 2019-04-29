import db from './index'

import * as uuidv4 from 'uuid/v4'

import { AdminSessions, Admins, Uuid } from './types'
import { Result, ok, err } from 'neverthrow'
import { RouteError } from 'routes/types'

const cols = [
  AdminSessions.Table.cols.admin_user_id,
  AdminSessions.Table.cols.uuid,  
].join(', ')

// remove any past sessions pertaining to user
export const initAdminSession = async (
  { id }: Admins.Schema
): Promise<Result<Uuid, RouteError>> => {
  const uuid = uuidv4()

  try {
    await db.raw(`
      INSERT INTO ${AdminSessions.Table.name} (${cols})
      VALUES (:adminId, :uuid)
      ON CONFLICT (${AdminSessions.Table.cols.admin_user_id}) DO UPDATE
        SET ${AdminSessions.Table.cols.uuid} = :uuid
      RETURNING *
    `, { adminId: id, uuid })

    return ok(uuid)
  } catch (e) {
    return err(
      RouteError.Other
    )
  }
}

export const getAdminFromSession = async (
  sessionId: Uuid,
): Promise<Result<Admins.Schema, RouteError>> => {
  type Ok = Admins.Schema

  try {
    const adminUserIdColumn = [
      AdminSessions.Table.name,
      AdminSessions.Table.cols.admin_user_id
    ].join('.')

    const admin: Ok | null = await db(Admins.Table.name)
      .first(`${Admins.Table.name}.*`)
      .join(
        AdminSessions.Table.name,
        `${Admins.Table.name}.${Admins.Table.cols.id}`,
        adminUserIdColumn
      )
      .where(
        `${AdminSessions.Table.name}.${AdminSessions.Table.cols.uuid}`, 
        sessionId
      )
      // sessions expire after 7 days of inactivity
      .whereRaw(`
        date_part('day', NOW() - ${AdminSessions.Table.name}.${AdminSessions.Table.cols.updated_at})::INT <= 7
      `)

    return admin
        ? ok(admin)
        : err(RouteError.NotFound)
  } catch (e) {
    return err(RouteError.Other)
  }
}
