/* eslint-disable @typescript-eslint/camelcase */
import { PrismaClient, Admin, Site } from '@prisma/client'

import logger from 'logger'

import { ResultAsync, ok, err, errAsync } from 'neverthrow'

import * as bcrypt from 'bcrypt'

import { NewAdmin } from 'routes/admins/signup'

import { RouteError } from 'routes/types'

const prisma = new PrismaClient()

const isObj = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null


const BCRYPT_HASH_ROUNDS = 10

export const createAdmin = (admin: NewAdmin): ResultAsync<Admin, RouteError> => ResultAsync.fromPromise(
  bcrypt.hash(admin.password, BCRYPT_HASH_ROUNDS)
    .then(pwHash =>
      prisma.admin.create({
        data: {
          email: admin.email,
          username: admin.username,
          password: pwHash,
        }
      })
    ),
  e => {
    // FIXME:
    // https://github.com/parlez-vous/server/issues/39
    if (isObj(e) && isObj(e.result) && Array.isArray(e.result.errors) && e.result.errors[0].code === 3010) {
      return RouteError.Conflict
    }

    logger.warn('Query Error', 'createAdmin', e)

    return RouteError.Other
  }
)


export const validateAdmin = (
  username: Admin['username'],
  password: Admin['password']
): ResultAsync<Admin, RouteError> =>
  ResultAsync.fromPromise(
    prisma.admin.findOne({
      where: {
        username: username,
      }
    }),
    (_prismaError) => RouteError.Other,
  )
    .andThen((admin) =>
      !admin
        ? errAsync(RouteError.NotFound)
        : ResultAsync.fromPromise(
            bcrypt.compare(password, admin.password),
            (_) => {
              logger.error('bcrypt error - validateAdmin - threw when comparing passwords')
              return RouteError.Other
            }
          )
          .andThen((match) =>
            match ? ok(admin) : err(RouteError.NotFound)
          )
    )



export const getAdmin = (
  adminId: Admin['id']
): ResultAsync<Admin, RouteError> => 
  ResultAsync.fromPromise(
    prisma.admin.findOne({
      where: {
        id: adminId,
      }
    }),
    (_) => RouteError.Other
  )
  .andThen(admin =>
    admin ? ok(admin) : err(RouteError.NotFound)
  )


export const getAdminSites = (
  adminUserId: Admin['id']
): ResultAsync<Array<Site>, RouteError> =>
  ResultAsync.fromPromise(
    prisma
      .site
      .findMany({
        where: {
          admin_id: adminUserId,
        },
      }),
    (_) => RouteError.Other
  )


export const getSingleSite = (
  siteId: Site['id']
): ResultAsync<Site, RouteError> => 
  ResultAsync.fromPromise(
    prisma.site.findOne({
      where: {
        id: siteId,
      }
    }),
    (e) => {
      logger.warn(`[Query Error] getSingleSite - ${e}`)

      return RouteError.Other
    }
  )
  .andThen((site) =>
    site ? ok(site) : err(RouteError.NotFound)
  )


// register website for admin
export const registerSite = (
  adminId: Admin['id'],
  hostname: string
): ResultAsync<Site, RouteError> => {
  const addSiteForAdmin = () => 
    prisma.site.create({
      data: {
        hostname,
        admin: {
          connect: {
            id: adminId,
          }
        }
      },
    })

  return ResultAsync.fromPromise(
    addSiteForAdmin(),
    (e) => {
      if (isObj(e) && e.code && e.code === '23505') {
        return RouteError.Conflict
      }

      logger.warn('Query Error', 'createAdmin', e)
      return RouteError.Other
    }
  )
}


export const getUnverifiedSites = (): Promise<Array<Site>> =>
  prisma.site.findMany({
    where: {
      verified: false,
    },
  })


export const setSitesAsVerified = async (
  siteIds: Array<Site['id']>
): Promise<void> => {
  await prisma.site.updateMany({
    data: {
      verified: true,
    },
    where: {
      id: {
        in: siteIds,
      },
    },
  })
}

