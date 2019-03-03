import { route } from './middleware'

import { Result } from 'utils'

export const handler = route((_, session) =>
  Result.ok(session.destroySession())
)
