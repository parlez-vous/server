import { route, AppData } from 'router'

import { DecodeResult } from 'routes/parser'

import { User } from 'db/types'

export const handler = route<User.WithoutPassword>((_, session) =>
  DecodeResult.pass(session.getSessionUser().map(AppData.init))
)
