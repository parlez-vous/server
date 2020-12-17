import { camelCase, isObject } from 'utils'
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

    const camelCasedKey = camelCase(key)

    if (isObject(val)) {
      return {
        ...serialized,
        [camelCasedKey]: objectSerializer(val),
      }
    }

    if (Array.isArray(val)) {
      return {
        ...serialized,
        [camelCasedKey]: val.map(valueSerializer),
      }
    }

    return {
      ...serialized,
      [camelCasedKey]: valueSerializer(val),
    }
  }, {})

export const arraySerializer = <T>(list: T[]): JSONValues[] =>
  list.map(valueSerializer)

export const valueSerializer = <T>(val: T): JSONValues => {
  if (val instanceof Date) {
    return dateSerializer(val)
  }

  if (isObject(val)) {
    return objectSerializer(val)
  }

  if (Array.isArray(val)) {
    // FIXME: improve typesafety here
    return arraySerializer(val as any[])
  }

  // FIXME: improve typesafety here
  return (val as unknown) as JSONValues
}
