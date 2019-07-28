import * as db from 'db/actions'
import { route, AppData } from 'routes/middleware'
import { decode } from 'routes/parser'
import { String } from 'runtypes'

import { Sites } from 'db/types'


const siteIdDecoder = String.withConstraint(
  s => !Number.isNaN(parseInt(s, 10))
)

export const handler = route<Sites.Schema>((req, sessionManager) =>
  decode(siteIdDecoder, req.params.id).map(async (siteId) => 
    sessionManager
      .getSessionUser()
      .then((result) =>
        result.asyncMap(({ id }) =>
          db.getSingleSite(id, parseInt(siteId, 10))
        )
      )
      .then((result) =>
        result.andThen(innerResult =>
          innerResult.map(AppData.init)
        )
      )
    )
)
