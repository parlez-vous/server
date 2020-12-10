/* eslint-disable @typescript-eslint/camelcase */

import { Admin } from 'db/types'

export const removePassword = ({
  // eslint-disable-next-line
  password,
  ...rest
}: Admin): Admin.WithoutPassword => rest
