import { route, SessionError } from './middleware'

import { Result } from 'utils'

export const handler = route((_, res) => 
  Result.ok(
    res.getSessionUser()
      .then((result) => result.mapErr(SessionError.toString))
  )
)
