import { route } from './middleware'

import { Result } from 'utils'

export const handler = route((_, res) =>
  Result.ok(res.destroySession())
)
