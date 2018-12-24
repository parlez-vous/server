import { RequestHandler } from 'express'

import { fetchComments } from 'db/actions'
import { deserializeRequest } from './middleware'

export const handler: RequestHandler = (req, res) => {
  deserializeRequest(req)
    .map(fetchComments)
    .mapErr(e => {
      res.status(400).json({ err: e })
    })
    .map((p) => {
      p.then((result) => {
        result
          .map((comments) => {
            res.status(200).json(comments)
          })
          .mapErr(() => {
            res.status(500).json({
              err: 'Error while fetching comments'
            })
          })
      })
    })
}
