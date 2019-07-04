/**
 * Cron job to check to see if clients have added
 * a verification TXT record to their hostname
 */

import { cronIntervalMins } from 'env'
import { getUnverifiedSites, setSitesAsVerified } from 'db/actions'
import { resolveTXTRecord, failedLookupError } from 'utils'
import logger from 'logger'


const verifyDnsEntries = async () => {
  const startTime = Date.now()

  logger.info('[verifyDnsEntries] Job Started')

  const sites = await getUnverifiedSites()

  const dnsQueryResults = await Promise.all(
    sites.map((s) => resolveTXTRecord(s.hostname)
      .then((result) => ({
        dnsLookupResult: result,
        site: s
      }))
      .catch(e => {
        logger.error([
          `[verifyDnsEntries] Error while resolving TXT record for "${s.hostname}"`,
          `Error: ${JSON.stringify(e)}`
        ].join(' '))

        return {
          dnsLookupResult: failedLookupError,
          site: s
        }
      })
    )
  )

  const verifiedSites = dnsQueryResults
    .filter(({ dnsLookupResult, site }) => dnsLookupResult
      .match(
        (ok) => {
          if (!ok) {
            return false
          }
    
          return ok.some(([ record ]) =>
            record === `parlez-vous-site-verification=${site.dns_tag}`
          )
        },
        _e => false
      )
    )
    .map(({ site }) => site.id)

  if (verifiedSites.length > 0) {
    await setSitesAsVerified(verifiedSites)
  }

  const endTime = Date.now()
  const totalTime = endTime - startTime

  logger.info('[verifyDnsEntries] Job Ended - Total Time ms: ' + totalTime)
}


export const start = () => {
  setInterval(() => {
    verifyDnsEntries()
  }, cronIntervalMins)
}
