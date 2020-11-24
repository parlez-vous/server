import { route, AppData } from 'router'

import { DecodeResult } from 'routes/parser'

import { Admin } from 'db/types'
import { serialize } from 'resources/admins'

export const handler = route<Admin>((_, session) =>
  DecodeResult.pass(session.getSessionUser().map(AppData.init)),
  serialize
)
