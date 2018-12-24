import { RequestHandler } from 'express'
import { deserializeRequest, RequestBodyInfo } from './middleware'

import { Result } from '../../utils'

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

export const handler: RequestHandler = (req, res) => {
  const bodyParams: Array<RequestBodyInfo> = [
    { name: 'vote', type: 'number' }
  ]

  deserializeRequest<Vote>(req, bodyParams)
    .map(addVote)
    .mapErr(e => {
      res.status(400).json({ err: e })
    })
    .map((p) => {
      p.then(result => {
        result.map(() => {
          res.sendStatus(200)
        })
        // these errors should
        // probably not be sent
        // straight to the user
        // might contain sensative info
        // or give away that we're using
        // postgres
        .mapErr(e => {
          res
            .status(500)
            .json({
              err: e
            })
        }) 
      })
    })
}
