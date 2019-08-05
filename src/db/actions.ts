import db from './index'

import logger from 'logger'

import { Result, ok, err } from 'neverthrow'

import { v4 } from 'uuid'

import * as bcrypt from 'bcrypt'

import { URL } from 'url'

import { NewAdmin } from 'routes/admins/signup'
import { Admin } from 'routes/admins/signin'

import { Admins, Sites, Comments, Users, Posts } from './types'
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


export const getSingleSite = async (
  adminUserId: number,
  siteId: number
): Promise<Result<Sites.Schema, RouteError>> => {
  try {
    const site: Sites.Schema | null = await db(Sites.Table.name)
      .first(`${Sites.Table.name}.*`)
      .join(
        Admins.Table.name,
        `${Admins.Table.name}.${Admins.Table.cols.id}`,
        `${Sites.Table.name}.${Sites.Table.cols.admin_user_id}`,
      )
      .where(
        `${Admins.Table.name}.${Admins.Table.cols.id}`,
        adminUserId
      )
      .andWhere(
        `${Sites.Table.name}.${Admins.Table.cols.id}`,
        siteId
      )

    return site
      ? ok(site)
      : err(RouteError.NotFound)
  } catch (e) {
    logger.warn(`[Query Error] getSingleSite - ${e}`)  

    return err(RouteError.Other)
  }
}


// register website for admin
export const registerSite = async (adminId: number, url: URL): Promise<Result<Sites.Schema, RouteError>> => {
  try {
    const newSite: Sites.Schema = await db(Sites.Table.name)
      .insert({
        [Sites.Table.cols.hostname]: url.hostname,
        [Sites.Table.cols.admin_user_id]: adminId,

        // v4 uuid
        [Sites.Table.cols.dns_tag]: v4()
      })
      .returning('*')
      .then(([ site ]) => site)

    return ok(newSite)
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

export const getUnverifiedSites = async (): Promise<Array<Sites.Schema>> => {
  const sites = await db(Sites.Table.name)
    .select('*')
    .where(
      Sites.Table.cols.verified,
      false
    )

  return sites
}

export const setSitesAsVerified = async (siteIds: Array<number>): Promise<void> => {
  await db(Sites.Table.name)
    .update({
      [Sites.Table.cols.verified]: true
    })
    .whereIn(
      Sites.Table.cols.id,
      siteIds
    )
}


type CommentWithAuthor = Comments.Schema & {
  author_username: Users.Schema['username']
}

export const getSiteComments = async (
  siteId: number
): Promise<Result<Array<CommentWithAuthor>, RouteError>> => {
  try {
    const siteComments = await db(Comments.Table.name)
      .select(
        `${Comments.Table.name}.*`,
        `${Users.Table.name}.${Users.Table.cols.username} as author_username`
      )
      .join(
        Users.Table.name,
        `${Comments.Table.name}.${Comments.Table.cols.author_id}`,
        `${Users.Table.name}.${Users.Table.cols.id}`
      )
      .join(
        Posts.Table.name,
        `${Comments.Table.name}.${Comments.Table.cols.post_id}`,
        `${Posts.Table.name}.${Posts.Table.cols.id}`
      )
      .where(`${Posts.Table.name}.${Posts.Table.cols.site_id}`, siteId)

    return ok(siteComments)
  } catch (e) {
    logger.error(`[getSiteComments] - Error getting site comments - ${e}`)
    return err(RouteError.Other)
  }
}

