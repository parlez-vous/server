import { Admin, serializeDate } from 'db/types'

export const removePassword = ({
  // eslint-disable-next-line
  password,
  ...rest
}: Admin): Omit<Admin, 'password'> => rest

export const serialize = (admin: Admin) => ({
  ...removePassword(admin),
  created_at: serializeDate(admin.created_at),
  updated_at: serializeDate(admin.updated_at),
})

