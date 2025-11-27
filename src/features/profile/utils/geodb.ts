// GeoDB Cities API integration for location autocomplete
// API Documentation: https://rapidapi.com/wirefreethought/api/geodb-cities

const GEODB_API_URL = 'https://wft-geo-db.p.rapidapi.com/v1/geo'
const GEODB_API_KEY = process.env.NEXT_PUBLIC_GEODB_API_KEY || ''
const GEODB_API_HOST = 'wft-geo-db.p.rapidapi.com'

interface GeoDBCountry {
  code: string
  name: string
  wikiDataId: string
}

interface GeoDBRegion {
  id: string
  name: string
  countryCode: string
  isoCode: string
}

interface GeoDBCity {
  id: number
  name: string
  country: string
  countryCode: string
  region: string
  regionCode: string
}

interface GeoDBResponse<T> {
  data: T[]
  metadata?: {
    currentOffset: number
    totalCount: number
  }
}

/**
 * Busca países por nome
 * @param namePrefix Prefixo do nome do país para buscar
 * @param languageCode Código do idioma (ex: 'pt' para português)
 * @returns Lista de países encontrados
 */
export async function searchCountries(
  namePrefix: string,
  languageCode: string = 'pt'
): Promise<GeoDBCountry[]> {
  if (!namePrefix || namePrefix.length < 2) {
    return []
  }

  try {
    const url = new URL(`${GEODB_API_URL}/countries`)
    url.searchParams.append('namePrefix', namePrefix)
    url.searchParams.append('languageCode', languageCode)
    url.searchParams.append('limit', '10')

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': GEODB_API_KEY,
        'X-RapidAPI-Host': GEODB_API_HOST,
      },
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar países: ${response.statusText}`)
    }

    const data: GeoDBResponse<GeoDBCountry> = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Erro ao buscar países:', error)
    return []
  }
}

/**
 * Busca regiões/estados de um país
 * @param countryCode Código ISO do país (ex: 'BR' para Brasil)
 * @param namePrefix Prefixo do nome da região para buscar
 * @returns Lista de regiões encontradas
 */
export async function searchRegions(
  countryCode: string,
  namePrefix?: string
): Promise<GeoDBRegion[]> {
  if (!countryCode) {
    return []
  }

  try {
    const url = new URL(`${GEODB_API_URL}/countries/${countryCode}/regions`)
    if (namePrefix && namePrefix.length >= 2) {
      url.searchParams.append('namePrefix', namePrefix)
    }
    url.searchParams.append('limit', '30')

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': GEODB_API_KEY,
        'X-RapidAPI-Host': GEODB_API_HOST,
      },
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar regiões: ${response.statusText}`)
    }

    const data: GeoDBResponse<GeoDBRegion> = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Erro ao buscar regiões:', error)
    return []
  }
}

/**
 * Busca cidades por nome
 * @param namePrefix Prefixo do nome da cidade para buscar
 * @param countryCode Código ISO do país (opcional, ex: 'BR')
 * @param regionCode Código da região/estado (opcional)
 * @returns Lista de cidades encontradas
 */
export async function searchCities(
  namePrefix: string,
  countryCode?: string,
  regionCode?: string
): Promise<GeoDBCity[]> {
  if (!namePrefix || namePrefix.length < 2) {
    return []
  }

  try {
    const url = new URL(`${GEODB_API_URL}/cities`)
    url.searchParams.append('namePrefix', namePrefix)
    url.searchParams.append('limit', '10')
    url.searchParams.append('languageCode', 'pt')

    if (countryCode) {
      url.searchParams.append('countryIds', countryCode)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': GEODB_API_KEY,
        'X-RapidAPI-Host': GEODB_API_HOST,
      },
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar cidades: ${response.statusText}`)
    }

    const data: GeoDBResponse<GeoDBCity> = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Erro ao buscar cidades:', error)
    return []
  }
}

/**
 * Lista de estados brasileiros (fallback caso a API não esteja disponível)
 */
export const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
]
