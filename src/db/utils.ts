import { Table } from './types'

export const everything = <T>(
  t: Table<T>
): Array<string> => Object.keys(t.cols)
