import HashIds from 'hashids'

import { hashIdSalt } from './env'

export const hasher = new HashIds(hashIdSalt, 6)

// https://github.com/chriso/validator.js/blob/master/src/lib/isUUID.js
export const isUUID = (str: string): boolean => {
  // v4 uuids only
  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

  return uuidRegex.test(str)
}
