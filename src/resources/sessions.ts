import { Admin, UUID } from 'db/types'
// https://trello.com/c/9jyhDVuh

type SessionId = UUID

interface Session {
  adminId: Admin['id']
  last_accessed_at: Date
}

const sessionDb: Map<SessionId, Session> = new Map()

export default sessionDb

