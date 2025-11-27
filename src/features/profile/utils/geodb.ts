// Location autocomplete using free public APIs
// - IBGE API for Brazilian states and cities (official government data)
// - REST Countries API for countries (free, no API key required)
// All data is in PT-BR format with proper locale sorting

export interface Country {
  code: string
  name: string
}

export interface State {
  code: string
  name: string
}

export interface City {
  name: string
  state: string
}

// Cache para evitar chamadas repetidas
const cache = {
  countries: null as Country[] | null,
  states: null as State[] | null,
  cities: new Map<string, City[]>(),
}

/**
 * Remove acentos para busca mais flexível
 */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Mapa de traduções personalizadas para países em PT-BR
 * Garante nomes corretos mesmo quando a API retorna traduções incorretas
 */
const COUNTRY_NAME_OVERRIDES: Record<string, string> = {
  'BR': 'Brasil',
  'US': 'Estados Unidos',
  'GB': 'Reino Unido',
  'NL': 'Holanda',
  'CH': 'Suíça',
  'KR': 'Coreia do Sul',
  'ZA': 'África do Sul',
  'NZ': 'Nova Zelândia',
  'AE': 'Emirados Árabes Unidos',
}

/**
 * Busca países usando REST Countries API
 * API: https://restcountries.com/
 * Totalmente gratuita, sem API key
 * Retorna nomes em PT-BR com ordenação alfabética correta
 */
export async function searchCountries(
  namePrefix: string,
  languageCode: string = 'pt'
): Promise<Country[]> {
  if (!namePrefix || namePrefix.length < 2) {
    return []
  }

  try {
    // Carrega todos os países uma vez e mantém em cache
    if (!cache.countries) {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
      if (!response.ok) throw new Error('Failed to fetch countries')

      const data = await response.json()
      cache.countries = data
        .map((country: any) => {
          const code = country.cca2
          // Usa override se existir, senão pega tradução PT ou nome em inglês
          const name = COUNTRY_NAME_OVERRIDES[code] ||
                      country.name.translations?.por?.common ||
                      country.name.common
          return { code, name }
        })
        // Ordenação alfabética PT-BR (respeita acentuação)
        .sort((a: Country, b: Country) => a.name.localeCompare(b.name, 'pt-BR'))
    }

    // Busca flexível: ignora acentos e maiúsculas
    const searchNormalized = removeAccents(namePrefix.toLowerCase())
    return cache.countries
      .filter(country => {
        const nameNormalized = removeAccents(country.name.toLowerCase())
        return nameNormalized.includes(searchNormalized)
      })
      .slice(0, 10)
  } catch (error) {
    console.error('Error fetching countries:', error)

    // Fallback para lista básica em caso de erro
    const searchNormalized = removeAccents(namePrefix.toLowerCase())
    return FALLBACK_COUNTRIES.filter(country => {
      const nameNormalized = removeAccents(country.name.toLowerCase())
      return nameNormalized.includes(searchNormalized)
    }).slice(0, 10)
  }
}

/**
 * Busca estados usando IBGE API
 * API: https://servicodados.ibge.gov.br/api/
 * Totalmente gratuita, oficial do governo brasileiro
 * Dados já vêm ordenados em PT-BR pela API
 */
export async function searchRegions(
  countryCode: string,
  namePrefix?: string
): Promise<State[]> {
  if (countryCode !== 'BR') {
    return []
  }

  try {
    // Carrega todos os estados uma vez e mantém em cache
    if (!cache.states) {
      const response = await fetch(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
      )
      if (!response.ok) throw new Error('Failed to fetch states')

      const data = await response.json()
      cache.states = data.map((state: any) => ({
        code: state.sigla,
        name: state.nome,
      }))
    }

    // Se não tem filtro, retorna todos
    if (!namePrefix || namePrefix.length < 1) {
      return cache.states
    }

    // Busca flexível: ignora acentos e maiúsculas (permite "sao" encontrar "São Paulo")
    const searchNormalized = removeAccents(namePrefix.toLowerCase())
    return cache.states.filter(state => {
      const nameNormalized = removeAccents(state.name.toLowerCase())
      const codeNormalized = state.code.toLowerCase()
      return nameNormalized.includes(searchNormalized) || codeNormalized.includes(searchNormalized)
    })
  } catch (error) {
    console.error('Error fetching states:', error)

    // Fallback para lista básica em caso de erro
    if (!namePrefix || namePrefix.length < 1) {
      return FALLBACK_STATES
    }

    const searchNormalized = removeAccents(namePrefix.toLowerCase())
    return FALLBACK_STATES.filter(state => {
      const nameNormalized = removeAccents(state.name.toLowerCase())
      const codeNormalized = state.code.toLowerCase()
      return nameNormalized.includes(searchNormalized) || codeNormalized.includes(searchNormalized)
    })
  }
}

/**
 * Busca cidades usando IBGE API
 * API: https://servicodados.ibge.gov.br/api/
 * Retorna TODAS as 5.570 cidades brasileiras
 * Dados já vêm ordenados em PT-BR pela API
 */
export async function searchCities(
  namePrefix: string,
  countryCode?: string,
  stateCode?: string
): Promise<City[]> {
  if (!namePrefix || namePrefix.length < 2) {
    return []
  }

  if (countryCode && countryCode !== 'BR') {
    return []
  }

  try {
    const cacheKey = stateCode || 'all'

    // Verifica se já tem em cache
    if (!cache.cities.has(cacheKey)) {
      let url = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome'

      // Se tem estado específico, filtra pela UF
      if (stateCode) {
        const stateId = STATES_ID_MAP[stateCode.toUpperCase()]
        if (stateId) {
          url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios?orderBy=nome`
        }
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch cities')

      const data = await response.json()
      const cities = data
        .filter((city: any) => {
          // Validação defensiva: verifica se a estrutura existe
          return city?.nome &&
                 city?.microrregiao?.mesorregiao?.UF?.sigla
        })
        .map((city: any) => ({
          name: city.nome,
          state: city.microrregiao.mesorregiao.UF.sigla,
        }))

      cache.cities.set(cacheKey, cities)
    }

    // Busca flexível: ignora acentos e maiúsculas (permite "sao jose" encontrar "São José")
    const searchNormalized = removeAccents(namePrefix.toLowerCase())
    const cities = cache.cities.get(cacheKey) || []

    return cities
      .filter(city => {
        const nameNormalized = removeAccents(city.name.toLowerCase())
        return nameNormalized.includes(searchNormalized)
      })
      .slice(0, 15)
  } catch (error) {
    console.error('Error fetching cities:', error)

    // Em caso de erro, retorna array vazio
    return []
  }
}

/**
 * Mapa de siglas de estados para IDs do IBGE
 */
const STATES_ID_MAP: Record<string, string> = {
  'AC': '12', 'AL': '27', 'AP': '16', 'AM': '13', 'BA': '29',
  'CE': '23', 'DF': '53', 'ES': '32', 'GO': '52', 'MA': '21',
  'MT': '51', 'MS': '50', 'MG': '31', 'PA': '15', 'PB': '25',
  'PR': '41', 'PE': '26', 'PI': '22', 'RJ': '33', 'RN': '24',
  'RS': '43', 'RO': '11', 'RR': '14', 'SC': '42', 'SP': '35',
  'SE': '28', 'TO': '17',
}

/**
 * Lista de países (fallback em caso de erro na API)
 * Nomes em português brasileiro, ordenados alfabeticamente
 */
const FALLBACK_COUNTRIES: Country[] = [
  { code: 'ZA', name: 'África do Sul' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'AO', name: 'Angola' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AU', name: 'Austrália' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'BO', name: 'Bolívia' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CA', name: 'Canadá' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colômbia' },
  { code: 'KR', name: 'Coreia do Sul' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'EC', name: 'Equador' },
  { code: 'ES', name: 'Espanha' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'FR', name: 'França' },
  { code: 'GW', name: 'Guiné-Bissau' },
  { code: 'NL', name: 'Holanda' },
  { code: 'IN', name: 'Índia' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'IT', name: 'Itália' },
  { code: 'JP', name: 'Japão' },
  { code: 'MX', name: 'México' },
  { code: 'MZ', name: 'Moçambique' },
  { code: 'NZ', name: 'Nova Zelândia' },
  { code: 'PY', name: 'Paraguai' },
  { code: 'PE', name: 'Peru' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'ST', name: 'São Tomé e Príncipe' },
  { code: 'CH', name: 'Suíça' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'UY', name: 'Uruguai' },
  { code: 'VE', name: 'Venezuela' },
]

/**
 * Lista de estados brasileiros (fallback em caso de erro na API)
 */
const FALLBACK_STATES: State[] = [
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
