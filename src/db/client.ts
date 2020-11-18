import { PrismaClient } from '@prisma/client'

// expose a singleton
export const client = new PrismaClient()
