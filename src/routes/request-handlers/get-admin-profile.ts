import { route, AppData, SessionError } from './middleware'

import { Result } from 'utils'

import { Admins } from 'db/types'

export const handler = route<Admins.WithoutPassword>((_, session) => 
  Result.ok(
    session.getSessionUser()
      .then((result) =>
        result
          .mapOk((user) => AppData.init(user))
          .mapErr(() => SessionError.toString())
      )
  )
)
