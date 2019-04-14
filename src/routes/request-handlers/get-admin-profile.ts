import { route, AppData } from './middleware'

import { DecodeResult } from 'routes/parser'

import { Admins } from 'db/types'

export const handler = route<Admins.WithoutPassword>((_, session) => {
  return DecodeResult.ok(
    session
      .getSessionUser()
      .then((result) => result.mapOk(AppData.init))
  )
})
