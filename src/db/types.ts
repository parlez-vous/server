export type Uuid = string

type Schema<T> = {
  [k in keyof T]: keyof T
}

interface DefaultCols {
  id: number
  created_at: string
  updated_at: string
}



// https://github.com/Microsoft/TypeScript/pull/13288
const withColumns = <T>(columns: Array<keyof T>): Schema<T> => ({
  ...columns.reduce((cols, name) => ({
    ...(cols as any),
    [name]: name
  }), {})
})

// https://github.com/Microsoft/TypeScript/pull/13288
const withDefaults = <T>(
  columns: Array<keyof T>
): Schema<T & DefaultCols> => ({
  ...(withColumns(columns) as any),
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
  export interface Schema {
    id: number
    created_at: string
    hostname: string
  }

  export const Table: Table<Schema> = {
    name: 'sites',
    cols: withColumns([
      'id',
      'created_at',
      'hostname'
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
    author_id: number
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



