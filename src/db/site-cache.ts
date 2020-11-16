import { Id, Site } from './types'

/**
 * Created in order to reduce latency on query-intensive routes
 * such as 'get-comments' for embed that do several sequential reads
 */
class SiteCache {
  private cuidIndex: Record<string, number> = {}
  private hostnameIndex: Record<string, number> = {}
  private cachedSites: Site[] = []

  /**
   * Find site either by the site's ID or by the site's host name
   */
  findSite({ val, type_ }: Id): Site | null {
    const pointer =
      type_ === 'Cuid' ? this.cuidIndex[val] : this.hostnameIndex[val]

    if (pointer) {
      // assuming that if we have a pointer, then
      // indexing indo cachedSites with that pointer
      // will always return a value
      return this.cachedSites[pointer]
    }

    return null
  }

  setSite(site: Site): void {
    const len = this.cachedSites.push(site)

    const idx = len - 1

    this.cuidIndex[site.id] = idx
    this.hostnameIndex[site.hostname] = idx
  }
}

export const siteCache = new SiteCache()
