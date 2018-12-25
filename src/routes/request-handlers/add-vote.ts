import { RequestBodyInfo, handleRequest } from './middleware'

import { Result } from 'utils'

import { RequestInfo } from './types'

interface Vote {
  vote: number
}

const addVote = async (info: RequestInfo<Vote>): Promise<Result<number, string>> => {
  console.log('Adding Vote!')
  console.log(`Post: ${info.postId}`)
  console.log(`Host: ${info.host}`)
  console.log(`body: ${info.body.vote}`)

  return Result.ok(0)
}

const bodyParams: Array<RequestBodyInfo> = [
  { name: 'vote', type: 'number' }
]

export const handler = handleRequest(addVote, bodyParams)
