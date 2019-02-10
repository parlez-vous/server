import { RequestBodyInfo, handleRequest } from './middleware'

import { addComment } from 'db/actions'

export interface Comment {
  body: string
  authorId: number | null,
  parentId: number | null,
}

const bodyParams: Array<RequestBodyInfo<Comment>> = [
  { fieldName: 'body', type: ['string'] },
  { fieldName: 'authorId', type: ['number', 'null'] },
  { fieldName: 'parentId', type: ['number', 'null'] },
]

export const handler = handleRequest(addComment, bodyParams)
