import { validateAdmin } from 'db/actions'
import { route, AppData } from 'routes/middleware'
import { decode } from 'routes/parser'

import { Record, String } from 'runtypes'
import { Admin } from 'db/types'

const adminDecoder = Record({
  username: String,
  password: String,
})

export const handler = route<Admin.WithoutPassword>((req, session) =>
  decode(adminDecoder, req.body, 'Invalid request body').map(
    ({ username, password }) =>
      validateAdmin(username, password)
        .andThen(session.createSession)
        .map(({ sessionToken, admin }) => AppData.init(admin, sessionToken))
  )
)
