export type EntityKind = 'character' | 'episode' | 'location'

export type NamedReference = {
  id: string
  name: string
}

export type Character = {
  id: string
  name: string
  status: string
  species: string
  type: string
  gender: string
  image: string
  origin: NamedReference
  location: NamedReference
  episode: NamedReference[]
}

export type Episode = {
  id: string
  name: string
  air_date: string
  episode: string
  characters: NamedReference[]
}

export type Location = {
  id: string
  name: string
  type: string
  dimension: string
  residents: NamedReference[]
}
