import { create } from 'zustand'

export type CompareCharacter = {
  id: string
  name: string
  image: string
  status: string
  species: string
}

export type CompareEpisode = {
  id: string
  name: string
  episode: string
  air_date: string
}

type CompareState = {
  characters: CompareCharacter[]
  episodes: CompareEpisode[]
  canCompareCharacters: boolean
  canCompareEpisodes: boolean
  toggleCharacter: (value: CompareCharacter) => void
  toggleEpisode: (value: CompareEpisode) => void
}

export const useCompareStore = create<CompareState>((set, get) => ({
  characters: [],
  episodes: [],
  canCompareCharacters: false,
  canCompareEpisodes: false,
  toggleCharacter: (value) => {
    const characters = [...get().characters]
    const index = characters.findIndex((item) => item.id === value.id)

    if (index > -1) {
      characters.splice(index, 1)
    } else {
      if (characters.length === 2) characters.shift()
      characters.push(value)
    }

    set({
      characters,
      canCompareCharacters: characters.length === 2,
    })
  },
  toggleEpisode: (value) => {
    const episodes = [...get().episodes]
    const index = episodes.findIndex((item) => item.id === value.id)

    if (index > -1) {
      episodes.splice(index, 1)
    } else {
      if (episodes.length === 2) episodes.shift()
      episodes.push(value)
    }

    set({
      episodes,
      canCompareEpisodes: episodes.length === 2,
    })
  },
}))
