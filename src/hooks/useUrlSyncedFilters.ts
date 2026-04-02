import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

type FilterMap = Record<string, string>

export const useUrlSyncedFilters = <TFilters extends FilterMap>(defaults: TFilters) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = useMemo(() => {
    const rawValue = Number(searchParams.get('page') ?? 1)
    return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 1
  }, [searchParams])

  const filters = useMemo(() => {
    const values = {} as TFilters
    ;(Object.keys(defaults) as Array<keyof TFilters>).forEach((key) => {
      values[key] = (searchParams.get(String(key)) ?? defaults[key]) as TFilters[keyof TFilters]
    })
    return values
  }, [defaults, searchParams])

  const setPage = (value: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(value))
    setSearchParams(next, { replace: true })
  }

  const setFilter = <K extends keyof TFilters>(key: K, value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', '1')
    if (value) {
      next.set(String(key), value)
    } else {
      next.delete(String(key))
    }
    setSearchParams(next, { replace: true })
  }

  const resetFilters = () => {
    const next = new URLSearchParams()
    next.set('page', '1')
    setSearchParams(next, { replace: true })
  }

  return { page, filters, setPage, setFilter, resetFilters }
}
