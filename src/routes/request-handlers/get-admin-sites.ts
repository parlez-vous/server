import * as db from 'db/actions'
import { route, AppData } from 'routes/middleware'
import { DecodeResult } from 'routes/parser'

import { Sites } from 'db/types'

export const handler = route<Array<Sites.Schema>>((_, sessionManager) =>
  DecodeResult.pass(
    sessionManager
      .getSessionUser()
      .then((result) =>
        result.asyncMap(({ id }) => db.getAdminSites(id))
      )
      .then((result) =>
        result.andThen(innerResult =>
          innerResult.map(AppData.init)
        )
      )
  )
)