
import { Admin } from 'prisma-client'

type CUID = Admin['id']

const sessionMap = new Map<CUID, {}>()

export default sessionMap
