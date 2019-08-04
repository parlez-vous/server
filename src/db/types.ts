export type Uuid = string

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
) => ({
  ...(withColumns<T>(columns)),
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
    dns_tag: Uuid
  }

  export type Schema = WithDefaultCols<Columns>

  export const Table: Table<Schema> = {
    name: 'sites',
    cols: withDefaults([
      'admin_user_id',
      'hostname',
      'verified',
      'dns_tag'
    ])
  }
}




export namespace Admins {
  export interface Columns {
    username: string
    password: string
  }

  export type Schema = WithDefaultCols<Columns>

  export type WithoutPassword =
    Pick<
      Schema,
      'id' |
      'username' |
      'created_at' |
      'updated_at'
    >

  export const Table: Table<Schema> = {
    name: 'admin_users',
    cols: withDefaults([
      'username',
      'password'
    ])
  }

  export const removePassword = ({
    password,
    ...rest
  }: Schema): WithoutPassword => rest
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




export namespace AdminSessions {
  // TODO: assess cookie-based expiry 
  // (Expires derictive)
  export interface Columns {
    uuid: Uuid
    admin_user_id: number
  }

  export type Schema = WithDefaultCols<Columns>

  export const Table: Table<Schema> = {
    name: 'admin_user_sessions',
    cols: withDefaults([
      'uuid',
      'admin_user_id',
    ])
  }
}
