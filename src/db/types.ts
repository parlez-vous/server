import * as prisma from 'prisma-client'

export type UUID = string

export type Site = prisma.Site
export type Post = prisma.Post
export type Comment = prisma.Comment
export type User = prisma.User
export type Admin = prisma.Admin

export namespace Admin {
  export type WithoutPassword = Omit<Admin, 'password'>
}
