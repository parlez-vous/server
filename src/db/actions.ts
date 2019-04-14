import db from './index'
import { Result } from 'utils'

import * as bcrypt from 'bcrypt'

import { NewAdmin } from 'routes/request-handlers/admin-signup'
import { Admin } from 'routes/request-handlers/admin-signin'

import { Admins, Sites, AdminSessions, Uuid } from './types'
import { RouteError } from 'routes/types'

export const createAdmin = async (
  admin: NewAdmin
): Promise<Result<Admins.Schema, RouteError>> => {
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
    return Result.err(RouteError.Other)
  }
}


export const getAdmin = async (
  data: Admin
): Promise<Result<Admins.Schema, RouteError>> => {
  type Ok = Admins.Schema

  try {
    const admin: Ok | null = await db(Admins.Table.name)
      .first('*')
      .where({ username: data.username })

    if (!admin) {
      return Result.err(RouteError.NotFound)
    }

    const match = await bcrypt.compare(data.password, admin.password)

    return match
      ? Result.ok(admin)
      : Result.err(RouteError.NotFound)

  } catch (e) {
    return Result.err(RouteError.Other)
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
      // sessions expire after 7 days of inactivity
      .whereRaw(`
        date_part('day', NOW() - ${AdminSessions.Table.name}.${AdminSessions.Table.cols.updated_at})::INT <= 7
      `)

    return admin
        ? Result.ok(admin)
        : Result.err('Admin not found')
  } catch (e) {
    return Result.err<Ok, string>('Error while searching for admin')
  }
}


export const getAdminSites = async (
  adminUserId: number
): Promise<Result<Array<Sites.Schema>, RouteError>> => {
  try {
    const sites: Array<Sites.Schema> | null = await db(Sites.Table.name)
      .select(`${Sites.Table.name}.*`)
      .join(
        Admins.Table.name,
        `${Admins.Table.name}.${Admins.Table.cols.id}`,
        `${Sites.Table.name}.${Sites.Table.cols.admin_user_id}`,
      )
      .where(
        `${Admins.Table.name}.${Admins.Table.cols.id}`,
        adminUserId
      )

    return sites
      ? Result.ok(sites)
      : Result.err(RouteError.NotFound)
  } catch (e) {
    return Result.err(RouteError.Other)
  }
}
