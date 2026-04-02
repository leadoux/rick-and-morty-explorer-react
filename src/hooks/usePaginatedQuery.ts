import { useMemo } from 'react'
import { useQuery } from 'urql'

type PaginatedSelection<TItem> = {
  results: TItem[]
  pages: number
  count: number
}

type PaginatedQueryOptions<TData, TVariables, TItem> = {
  query: string
  variables: TVariables
  pause?: boolean
  select: (data: TData | undefined) => PaginatedSelection<TItem>
}

export const usePaginatedQuery = <TData, TVariables extends Record<string, unknown>, TItem>(
  options: PaginatedQueryOptions<TData, TVariables, TItem>,
) => {
  const [{ data, fetching, error }] = useQuery<TData, TVariables>({
    query: options.query,
    variables: options.variables,
    pause: Boolean(options.pause),
  })

  const selection = useMemo(() => options.select(data), [data, options])

  return {
    data,
    fetching,
    error,
    items: selection.results,
    totalPages: selection.pages,
    totalCount: selection.count,
  }
}
