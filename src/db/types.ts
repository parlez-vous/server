export type Uuid = string

// export enum QueryErrorType {
//   NotFound,
//   Other
// }

// export type QueryError
//   = { type: QueryErrorType.NotFound }
//   | { type: QueryErrorType.Other, msg: string }


type Schema<T> = {
  [k in keyof T]: keyof T
}

interface DefaultCols {
  id: number
  created_at: string
  updated_at: string
}


const withColumns = <T>(columns: Array<keyof T>): Schema<T> =>
  columns.reduce((cols, name) => ({
    ...cols,
    [name]: name
  }), {} as Schema<T>)


const withDefaults = <T>(
  columns: Array<keyof T>
): Schema<T> & DefaultCols => ({
  ...(withColumns<T>(columns) as any), // FIXME: THIS IS WRONG
  id: 'id',
  created_at: 'created_at',
  updated_at: 'updated_at'
})










export interface Table<T> {
  name: string
  cols: Schema<T>
}

type Nullable<T> = null | T

type WithDefaultCols<T> = T & DefaultCols




export namespace Sites {
  export interface Columns {
    admin_user_id: number
    hostname: string
    verified: boolean
  }

  type Schema = WithDefaultCols<Columns>

  export const Table: Table<Schema> = {
    name: 'sites',
    cols: withDefaults([
      'admin_user_id',
      'hostname',
      'verified'
    ])
  }
}




export namespace Admins {
  export interface Columns {
    username: string
    password: string
  }

  export type Schema = WithDefaultCols<Columns>

  export const Table: Table<Schema> = {
    name: 'admin_users',
    cols: withDefaults([
      'username',
      'password'
    ])
  }
}





export namespace Posts {
  export interface Columns {
    uuid: Uuid
    site_id: number
    votes: number
    views: number
  }

  export type Schema = WithDefaultCols<Columns>

  export const Table: Table<Schema> = {
    name: 'posts',
    cols: withDefaults([
      'site_id',
      'uuid',
      'views',
      'votes',
    ])
  }
}



export namespace Users {
  interface Columns {
    username: string
    karma: number
  }

  export type Schema = WithDefaultCols<Columns>

  export const Table: Table<Schema> = {
    name: 'users',
    cols: withDefaults([
      'karma',
      'username'
    ])
  }
}




export namespace Comments {
  interface Columns {
    post_id: number
    parent_id: Nullable<number>
    author_id: Nullable<number>
    body: string
    votes: number
  }

  export type Schema = WithDefaultCols<Columns>

  export const Table: Table<Schema> = {
    name: 'comments',
    cols: withDefaults([
      'post_id',
      'parent_id',
      'author_id',
      'body',
      'votes',
    ])
  }
}



