import * as db from 'db/actions'
import { route,  AppData } from 'routes/middleware'
import { DecodeResult } from 'routes/parser'
import { chain3 } from 'utils'
import { buildSite, fetchSiteWithComments, SiteWithExpiry } from 'resources/sites'

import { ok, Result, err } from 'neverthrow'
import { RouteError } from 'routes/types'
import { SessionManager } from 'routes/session'

const getExtendedSites = async (sessionManager: SessionManager): Promise<Result<Array<SiteWithExpiry>, RouteError>> =>
  chain3(
    sessionManager.getSessionUser(),
    ({ id }) => db.getAdminSites(id),
    async (sites) => {
      const fetchResultList = await Promise.all(sites.map(fetchSiteWithComments))

      return fetchResultList.reduce((acc, withCommentsResult) => {
        if (withCommentsResult.isErr()) {
          const routeError = withCommentsResult._unsafeUnwrapErr()
          return err(routeError)
        }

        return acc.map(
          sitesWithComments => sitesWithComments.concat(buildSite(withCommentsResult._unsafeUnwrap()))
        )
      }, ok([]) as Result<Array<SiteWithExpiry>, RouteError>)
    }
  )


export const handler = route<Array<SiteWithExpiry>>((_, sessionManager) =>
  DecodeResult.pass(
    getExtendedSites(sessionManager).then(result => result.map(AppData.init))
  )
)
