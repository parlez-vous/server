import { Admin, Site, prisma } from 'prisma-client'

import logger from 'logger'

import { Result, ok, err } from 'neverthrow'
import * as rt from 'runtypes'

import { v4 } from 'uuid'

import * as bcrypt from 'bcrypt'

import { NewAdmin } from 'routes/admins/signup'

import { RouteError } from 'routes/types'

export const createAdmin = async (
  admin: NewAdmin
): Promise<Result<Admin, RouteError>> => {
  const saltRounds = 10

  try {
    const pwHash = await bcrypt.hash(admin.password, saltRounds)

    const result = await prisma.createAdmin({
      username: admin.username,
      password: pwHash
    })

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


export const validateAdmin = async (
  username: Admin['username'],
  password: Admin['password']
): Promise<Result<Admin, RouteError>> => {
  try {
    const admin = await prisma.admin({
      username,
    })
    
    if (!admin) {
      return err(RouteError.NotFound)
    }

    const match = await bcrypt.compare(password, admin.password)

    return match
      ? ok(admin)
      : err(RouteError.NotFound)

  } catch (e) {
    return err(RouteError.Other)
  }
}

export const getAdmin = async (adminId: Admin['id']): Promise<Result<Admin, RouteError>> => {
  try {
    const admin = await prisma.admin({
      id: adminId
    })

    return admin
      ? ok(admin)
      : err(RouteError.NotFound)
      
  } catch (e) {
    return err(RouteError.Other)
  }
}


type GetAdminSites = Result<Array<Site>, RouteError>
export const getAdminSites = async (
  adminUserId: Admin['id']
): Promise<GetAdminSites> => {
  try {
    const sites = await prisma.admin({
      id: adminUserId
    }).sites()

    return ok(sites)
  } catch (e) {
    return err(RouteError.Other)
  }
}



export const getSingleSite = async (
  adminUserId: Admin['id'],
  siteId: Site['id']
): Promise<Result<Site, RouteError>> => {
  try {
    const sites = await prisma.admin({
      id: adminUserId,
    }).sites({
      where: {
        id: siteId,
      },
      first: 1,
    })

    const site = sites[0]

    return site
      ? ok(site)
      : err(RouteError.NotFound)
  } catch (e) {
    logger.warn(`[Query Error] getSingleSite - ${e}`)  

    return err(RouteError.Other)
  }
}


// register website for admin
export const registerSite = async (
  adminId: Admin['id'],
  hostname: string
): Promise<Result<Site, RouteError>> => {
  try {
    const sites = await prisma.updateAdmin({
      data: {
        sites: {
          create: {
            hostname,
            dns_tag: v4()
          }
        }
      },
      where: {
        id: adminId,
      }
    }).sites()

    const newSite = sites[0]

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

export const getUnverifiedSites = async (): Promise<Array<Site>> => {
  const sites = await prisma.sites({
    where: {
      verified: false
    }
  })

  return sites
}

export const setSitesAsVerified = async (siteIds: Array<Site['id']>): Promise<void> => {
  await prisma.updateManySites({
    data: {
      verified: true
    },
    where: {
      id_in: siteIds
    }
  })
}




// FIXME: this query is wrongs

type GetSiteComments = Result<Array<CommentWithAuthor>, RouteError>

const commentWithAuthorUsernameParser = rt.Record({
  id: rt.String,
  body: rt.String,
  votes: rt.Number,
  created_at: rt.String,
  updated_at: rt.String,
  author_username: rt.String,
})

type CommentWithAuthor = rt.Static<typeof commentWithAuthorUsernameParser>

export const getSiteComments = async (
  siteId: Site['id']
): Promise<GetSiteComments> => {
  try {
    const fragment = `
      fragment SiteComments on Post {
        comments {
          id
          body
          votes
          created_at
          updated_at
          author
        }
      }
    `

    const siteComments = await prisma.site({
      id: siteId
    }).posts().$fragment(fragment).then(
      rt.Array(commentWithAuthorUsernameParser).check
    )    

    return ok(siteComments)
  } catch (e) {
    logger.error(`[getSiteComments] - Error getting site comments - ${e}`)
    return err(RouteError.Other)
  }
}

