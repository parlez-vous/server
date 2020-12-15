/* eslint-disable @typescript-eslint/camelcase */

import { User } from 'db/types'

export const removePassword = ({
  // eslint-disable-next-line
  password,
  ...rest
}: User): User.WithoutPassword => rest
