import { Admin } from 'db/types'


export const removePassword = ({
  password,
  ...rest
}: Admin): Admin.WithoutPassword => rest
