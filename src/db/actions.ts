import db from './index'

import logger from 'logger'

import { Result, ok, err } from 'neverthrow'

import * as bcrypt from 'bcrypt'

import { NewAdmin } from 'routes/request-handlers/admin-signup'
import { Admin } from 'routes/request-handlers/admin-signin'

import { Admins, Sites } from './types'
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
  
    return ok(result)
  } catch (e) {

    if (e.code && e.code === '23505') {
      return err(
        RouteError.Conflict
      )
    }
    
    logger.warn('Query Error', 'createAdmin', e)

    return err(RouteError.Other) 
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
      return err(RouteError.NotFound)
    }

    const match = await bcrypt.compare(data.password, admin.password)

    return match
      ? ok(admin)
      : err(RouteError.NotFound)

  } catch (e) {
    return err(RouteError.Other)
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
      ? ok(sites)
      : err(RouteError.NotFound)
  } catch (e) {
    return err(RouteError.Other)
  }
}
