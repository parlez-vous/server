import { createAdmin } from 'db/actions'
import { route, decode } from './middleware'

import { Record, String, Static } from 'runtypes'

import { Result } from 'utils'

export type NewAdmin = Static<typeof adminSignupDecoder>

const adminSignupDecoder = Record({
  username: String,
  password: String,
  passwordConfirm: String,
})

export const handler = route(async (req) => {
  const body = decode(adminSignupDecoder, req.body)
  
  if (body.isErr()) {
    return Result.err('Invalid request body')
  }
  
  const parsed = body.unwrap()
  
  // https://www.npmjs.com/package/bcrypt#security-issuesconcerns
  if (
    parsed.password.length <= 7 ||
    parsed.password.length > 72
  ) {
    return Result.err('Password must be between 8 and 72 characters in length')
  }

  if (parsed.password !== parsed.passwordConfirm) {
    return Result.err('Passwords do not match')
  }

  if (parsed.username.length < 3) {
    return Result.err('Username must be at least 3 characters in length')
  }

  return createAdmin(body.unwrap())
})
