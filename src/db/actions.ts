import db from './index'
import { Result } from 'utils'

import * as bcrypt from 'bcrypt'

import { NewAdmin } from 'routes/request-handlers/admin-signup'
import { Admin } from 'routes/request-handlers/admin-signin'

import { Admins, DbError, AdminSessions, Uuid } from './types'

export const createAdmin = async (
  admin: NewAdmin
): Promise<Result<Admins.Schema, DbError>> => {
  type Ok = Admins.Schema

  const saltRounds = 10

  try {
    const pwHash = await bcrypt.hash(admin.password, saltRounds)

    const result: Ok = await db(Admins.Table.name)
      .insert({
        username: admin.username,
        password: pwHash
      })
      .returning('*')
      .then(([ user ]) => user)
  
    return Result.ok(result)
  } catch (e) {
    return Result.err(DbError.Other)
  }
}


export const getAdmin = async (
  data: Admin
): Promise<Result<Admins.Schema, DbError>> => {
  type Ok = Admins.Schema

  try {
    const admin: Ok | null = await db(Admins.Table.name)
      .first('*')
      .where({ username: data.username })

    if (!admin) {
      return Result.err(DbError.NotFound)
    }

    const match = await bcrypt.compare(data.password, admin.password)

    return match
      ? Result.ok(admin)
      : Result.err(DbError.NotFound)

  } catch (e) {
    return Result.err(DbError.Other)
  }
}

export const getAdminFromSession = async (
  sessionId: Uuid,
): Promise<Result<Admins.Schema, string>> => {
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

    return admin
        ? Result.ok(admin)
        : Result.err('Admin not found')
  } catch (e) {
    return Result.err<Ok, string>('Error while searching for admin')
  }
}
