import { UseQueryOptions } from '@tanstack/react-query'
import { ExecuteSqlData, ExecuteSqlError, useExecuteSqlQuery } from '../sql/execute-sql-query'
import { CREATE_PG_GET_TABLEDEF_SQL } from './database-query-constants'

type GetTableDefinition = {
  schema?: string
  name?: string
}

// [Joshen] Eventually move this into entity-definition-query
export const getTableDefinitionQuery = ({ schema = 'public', name }: GetTableDefinition) => {
  const sql = /* SQL */ `
    ${CREATE_PG_GET_TABLEDEF_SQL}

    select pg_temp.pg_get_tabledef (
      '${schema}',
      '${name}',
      false,
      'FKEYS_INTERNAL',
      'INCLUDE_TRIGGERS'
    ) as definition
  `.trim()

  return sql
}

export type TableDefinitionVariables = GetTableDefinition & {
  projectRef?: string
  connectionString?: string
}

export type TableDefinitionData = string
export type TableDefinitionError = ExecuteSqlError

export const useTableDefinitionQuery = <TData extends TableDefinitionData = TableDefinitionData>(
  { projectRef, connectionString, schema, name }: TableDefinitionVariables,
  options: UseQueryOptions<ExecuteSqlData, TableDefinitionError, TData> = {}
) => {
  return useExecuteSqlQuery(
    {
      projectRef,
      connectionString,
      sql: getTableDefinitionQuery({ schema, name }),
      queryKey: ['table-definition', schema, name],
    },
    {
      select(data) {
        return data.result[0].definition.trim()
      },
      ...options,
    }
  )
}
