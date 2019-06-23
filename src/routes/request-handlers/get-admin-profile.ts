import { route, AppData } from 'routes/middleware'

import { DecodeResult } from 'routes/parser'

import { Admins } from 'db/types'

export const handler = route<Admins.WithoutPassword>((_, session) => {
  return DecodeResult.pass(
    session
      .getSessionUser()
      .then((result) => result.map(AppData.init))
  )
})
