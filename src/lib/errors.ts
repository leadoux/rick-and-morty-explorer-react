type GraphQLErrorLike = {
  message?: unknown
}

type CombinedErrorLike = {
  graphQLErrors?: unknown
}

export const isNoResultsError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false

  const graphQLErrors = (error as CombinedErrorLike).graphQLErrors
  if (!Array.isArray(graphQLErrors)) return false

  return graphQLErrors.some((item: GraphQLErrorLike) => {
    if (!item || typeof item !== 'object') return false
    if (typeof item.message !== 'string') return false
    return item.message.toLowerCase().includes('there is nothing here')
  })
}
