/* eslint-disable @typescript-eslint/camelcase */
import * as prisma from '@prisma/client'

import { JSONValues } from 'router'
import { omit } from 'utils'

export const serializeDate = (d: Date): number => d.getTime()

export type UUID = string

// Some Resources have both an 'id' field that contains a cuid
// as well as a __other__ field that represents that resource's
// canonical id
//
// Site.hostname
// Post.url_slug

export type Cuid = { type_: 'Cuid'; val: string }
export type CanonicalId = { type_: 'Canonical'; val: string }

export type Id = Cuid | CanonicalId

export const canonicalId = (val: string): CanonicalId => ({
  type_: 'Canonical',
  val,
})

export const cuid = (val: string): Cuid => ({
  type_: 'Cuid',
  val,
})

export type Nullable<T> = T | null

export type Site = prisma.Site
export type Post = prisma.Post
export type CommentTreeState = prisma.CommentTreeState

export type Comment = prisma.Comment

export namespace Comment {
  // Incoming from the client-side
  export type Raw = {
    body: string
    parentCommentId: Nullable<string>
    authorId: Nullable<string>
    anonAuthorName: Nullable<string>
  }

  // This is the "raw" query response from prisma
  // Recursive comment tree
  export type WithRepliesAndAuthor = Comment & {
    replies?: WithRepliesAndAuthor[]
    author: Nullable<User>
  }

  type SerializedComment = Omit<Comment, 'updated_at' | 'created_at'> & {
    updated_at: number
    created_at: number
  }

  export const simpleSerialize = (comment: Comment): SerializedComment => ({
    ...comment,
    updated_at: serializeDate(comment.updated_at),
    created_at: serializeDate(comment.created_at),
  })

  export const serialize = (comment: WithRepliesAndAuthor): JSONValues => {
    const author = comment.author && omit(comment.author, ['password'])

    return {
      ...simpleSerialize(comment),
      replies: comment.replies ? comment.replies.map(serialize) : null,
      author: author && {
        ...author,
        created_at: serializeDate(author.created_at),
        updated_at: serializeDate(author.updated_at),
      },
    }
  }
}

export type User = prisma.User
export type Admin = prisma.Admin
