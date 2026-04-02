export const CHARACTERS_QUERY = `
  query Characters($page: Int, $filter: FilterCharacter) {
    characters(page: $page, filter: $filter) {
      info { count pages next prev }
      results {
        id
        name
        status
        species
        gender
        image
        type
        origin { id name }
        location { id name }
      }
    }
  }
`

export const EPISODES_QUERY = `
  query Episodes($page: Int, $filter: FilterEpisode) {
    episodes(page: $page, filter: $filter) {
      info { count pages next prev }
      results {
        id
        name
        air_date
        episode
        characters { id name }
      }
    }
  }
`

export const LOCATIONS_QUERY = `
  query Locations($page: Int, $filter: FilterLocation) {
    locations(page: $page, filter: $filter) {
      info { count pages next prev }
      results {
        id
        name
        type
        dimension
        residents { id name }
      }
    }
  }
`

export const CHARACTER_DETAIL_QUERY = `
  query CharacterDetail($id: ID!) {
    character(id: $id) {
      id
      name
      status
      species
      type
      gender
      image
      origin { id name }
      location { id name }
      episode { id name }
    }
  }
`

export const EPISODE_DETAIL_QUERY = `
  query EpisodeDetail($id: ID!) {
    episode(id: $id) {
      id
      name
      air_date
      episode
      characters { id name image species status }
    }
  }
`

export const LOCATION_DETAIL_QUERY = `
  query LocationDetail($id: ID!) {
    location(id: $id) {
      id
      name
      type
      dimension
      residents { id name image species status }
    }
  }
`

export const GLOBAL_SEARCH_QUERY = `
  query GlobalSearch($name: String!) {
    characters(page: 1, filter: { name: $name }) {
      results {
        id
        name
        image
        status
        species
      }
    }
    episodes(page: 1, filter: { name: $name }) {
      results {
        id
        name
        episode
        air_date
      }
    }
    locations(page: 1, filter: { name: $name }) {
      results {
        id
        name
        type
        dimension
      }
    }
  }
`
