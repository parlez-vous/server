import logger from 'logger'
import { resolveTxt } from 'dns'
import { Result, ok, err } from 'neverthrow'

// https://github.com/chriso/validator.js/blob/master/src/lib/isUUID.js
export const isUUID = (str: string): boolean => {
  // v4 uuids only
  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

  return uuidRegex.test(str)
}


export const txtRecordValue = (uuid: string) => `parlez-vous-site-verification=${uuid}`


type SuccessfulLookup = string[][] | undefined
type FailedLookup = null

type DnsLookupResult = Result<SuccessfulLookup, FailedLookup> 

export const failedLookupError = err<SuccessfulLookup, FailedLookup>(null)

export const resolveTXTRecord = (hostname: string) => new Promise<DnsLookupResult>((resolve, _) => {
  resolveTxt(
    hostname, 
    (lookupError, result) => {
      if (lookupError) {
        logger.info(
          `[resolveTXTRecord] Error looking up "${hostname}"`
        )

        return resolve(err(null))
      }

      resolve(ok(result))
     }
  )
})
