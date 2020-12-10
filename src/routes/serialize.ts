import { isObject } from 'utils'
import { JSONObject, JSONValues } from 'router'

const dateSerializer = (date: Date): number => date.getTime()

// recursively traverse object and:
//  - serialize dates
//  - strip password fields
const objectSerializer = <T extends Record<string, unknown>>(
  obj: T
): JSONObject =>
  Object.entries(obj).reduce((serialized, [key, val]) => {
    if (key === 'password') {
      return serialized
    }

    if (isObject(val)) {
      return {
        ...serialized,
        [key]: objectSerializer(val),
      }
    }

    if (Array.isArray(val)) {
      return {
        ...serialized,
        [key]: val.map(valueSerializer),
      }
    }

    return {
      ...serialized,
      [key]: valueSerializer(val),
    }
  }, {})

export const valueSerializer = <T>(val: T): JSONValues => {
  if (val instanceof Date) {
    return dateSerializer(val)
  }

  if (isObject(val)) {
    return objectSerializer(val)
  }

  return (val as unknown) as JSONValues
}
