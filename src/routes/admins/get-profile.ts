import { route, AppData } from 'router'

import { DecodeResult } from 'routes/parser'

import { Admin } from 'db/types'

export const handler = route<Admin.WithoutPassword>((_, session) =>
  DecodeResult.pass(session.getSessionUser().map(AppData.init)),
)
