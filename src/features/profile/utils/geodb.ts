// Location autocomplete using local data
// Uses static lists to avoid API rate limits and provide instant results

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

/**
 * Lista de países em português (principais países)
 */
export const COUNTRIES: Country[] = [
  { code: 'BR', name: 'Brasil' },
  { code: 'PT', name: 'Portugal' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'AR', name: 'Argentina' },
  { code: 'UY', name: 'Uruguai' },
  { code: 'PY', name: 'Paraguai' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colômbia' },
  { code: 'PE', name: 'Peru' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'BO', name: 'Bolívia' },
  { code: 'EC', name: 'Equador' },
  { code: 'MX', name: 'México' },
  { code: 'ES', name: 'Espanha' },
  { code: 'FR', name: 'França' },
  { code: 'IT', name: 'Itália' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'CA', name: 'Canadá' },
  { code: 'AU', name: 'Austrália' },
  { code: 'NZ', name: 'Nova Zelândia' },
  { code: 'JP', name: 'Japão' },
  { code: 'CN', name: 'China' },
  { code: 'KR', name: 'Coreia do Sul' },
  { code: 'IN', name: 'Índia' },
  { code: 'ZA', name: 'África do Sul' },
  { code: 'EG', name: 'Egito' },
  { code: 'NG', name: 'Nigéria' },
  { code: 'KE', name: 'Quênia' },
  { code: 'AO', name: 'Angola' },
  { code: 'MZ', name: 'Moçambique' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'GW', name: 'Guiné-Bissau' },
  { code: 'ST', name: 'São Tomé e Príncipe' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'MO', name: 'Macau' },
]

/**
 * Lista de estados brasileiros
 */
export const BRAZILIAN_STATES: State[] = [
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

/**
 * Lista de principais cidades brasileiras por estado
 */
export const BRAZILIAN_CITIES: City[] = [
  // São Paulo
  { name: 'São Paulo', state: 'SP' },
  { name: 'Campinas', state: 'SP' },
  { name: 'Guarulhos', state: 'SP' },
  { name: 'São Bernardo do Campo', state: 'SP' },
  { name: 'Santo André', state: 'SP' },
  { name: 'Osasco', state: 'SP' },
  { name: 'Ribeirão Preto', state: 'SP' },
  { name: 'Sorocaba', state: 'SP' },
  { name: 'São José dos Campos', state: 'SP' },
  { name: 'Santos', state: 'SP' },

  // Rio de Janeiro
  { name: 'Rio de Janeiro', state: 'RJ' },
  { name: 'Niterói', state: 'RJ' },
  { name: 'Duque de Caxias', state: 'RJ' },
  { name: 'Nova Iguaçu', state: 'RJ' },
  { name: 'São Gonçalo', state: 'RJ' },
  { name: 'Campos dos Goytacazes', state: 'RJ' },
  { name: 'Petrópolis', state: 'RJ' },

  // Minas Gerais
  { name: 'Belo Horizonte', state: 'MG' },
  { name: 'Uberlândia', state: 'MG' },
  { name: 'Contagem', state: 'MG' },
  { name: 'Juiz de Fora', state: 'MG' },
  { name: 'Betim', state: 'MG' },
  { name: 'Montes Claros', state: 'MG' },

  // Bahia
  { name: 'Salvador', state: 'BA' },
  { name: 'Feira de Santana', state: 'BA' },
  { name: 'Vitória da Conquista', state: 'BA' },
  { name: 'Camaçari', state: 'BA' },
  { name: 'Ilhéus', state: 'BA' },

  // Paraná
  { name: 'Curitiba', state: 'PR' },
  { name: 'Londrina', state: 'PR' },
  { name: 'Maringá', state: 'PR' },
  { name: 'Ponta Grossa', state: 'PR' },
  { name: 'Cascavel', state: 'PR' },
  { name: 'Foz do Iguaçu', state: 'PR' },

  // Rio Grande do Sul
  { name: 'Porto Alegre', state: 'RS' },
  { name: 'Caxias do Sul', state: 'RS' },
  { name: 'Pelotas', state: 'RS' },
  { name: 'Canoas', state: 'RS' },
  { name: 'Santa Maria', state: 'RS' },

  // Pernambuco
  { name: 'Recife', state: 'PE' },
  { name: 'Jaboatão dos Guararapes', state: 'PE' },
  { name: 'Olinda', state: 'PE' },
  { name: 'Caruaru', state: 'PE' },

  // Ceará
  { name: 'Fortaleza', state: 'CE' },
  { name: 'Caucaia', state: 'CE' },
  { name: 'Juazeiro do Norte', state: 'CE' },
  { name: 'Sobral', state: 'CE' },

  // Pará
  { name: 'Belém', state: 'PA' },
  { name: 'Ananindeua', state: 'PA' },
  { name: 'Santarém', state: 'PA' },

  // Santa Catarina
  { name: 'Florianópolis', state: 'SC' },
  { name: 'Joinville', state: 'SC' },
  { name: 'Blumenau', state: 'SC' },
  { name: 'São José', state: 'SC' },

  // Goiás
  { name: 'Goiânia', state: 'GO' },
  { name: 'Aparecida de Goiânia', state: 'GO' },
  { name: 'Anápolis', state: 'GO' },

  // Maranhão
  { name: 'São Luís', state: 'MA' },
  { name: 'Imperatriz', state: 'MA' },

  // Espírito Santo
  { name: 'Vitória', state: 'ES' },
  { name: 'Vila Velha', state: 'ES' },
  { name: 'Serra', state: 'ES' },
  { name: 'Cariacica', state: 'ES' },

  // Paraíba
  { name: 'João Pessoa', state: 'PB' },
  { name: 'Campina Grande', state: 'PB' },

  // Amazonas
  { name: 'Manaus', state: 'AM' },

  // Rio Grande do Norte
  { name: 'Natal', state: 'RN' },
  { name: 'Mossoró', state: 'RN' },

  // Mato Grosso
  { name: 'Cuiabá', state: 'MT' },
  { name: 'Várzea Grande', state: 'MT' },

  // Mato Grosso do Sul
  { name: 'Campo Grande', state: 'MS' },
  { name: 'Dourados', state: 'MS' },

  // Alagoas
  { name: 'Maceió', state: 'AL' },

  // Piauí
  { name: 'Teresina', state: 'PI' },

  // Distrito Federal
  { name: 'Brasília', state: 'DF' },

  // Sergipe
  { name: 'Aracaju', state: 'SE' },

  // Rondônia
  { name: 'Porto Velho', state: 'RO' },

  // Tocantins
  { name: 'Palmas', state: 'TO' },

  // Acre
  { name: 'Rio Branco', state: 'AC' },

  // Amapá
  { name: 'Macapá', state: 'AP' },

  // Roraima
  { name: 'Boa Vista', state: 'RR' },
]

/**
 * Busca países por nome (local)
 */
export async function searchCountries(
  namePrefix: string,
  languageCode: string = 'pt'
): Promise<Country[]> {
  if (!namePrefix || namePrefix.length < 2) {
    return []
  }

  const search = namePrefix.toLowerCase()
  return COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(search)
  ).slice(0, 10)
}

/**
 * Busca estados (local)
 */
export async function searchRegions(
  countryCode: string,
  namePrefix?: string
): Promise<State[]> {
  if (countryCode !== 'BR') {
    return []
  }

  if (!namePrefix || namePrefix.length < 1) {
    return BRAZILIAN_STATES
  }

  const search = namePrefix.toLowerCase()
  return BRAZILIAN_STATES.filter(state =>
    state.name.toLowerCase().includes(search) ||
    state.code.toLowerCase().includes(search)
  )
}

/**
 * Busca cidades (local)
 */
export async function searchCities(
  namePrefix: string,
  countryCode?: string,
  stateCode?: string
): Promise<City[]> {
  if (!namePrefix || namePrefix.length < 2) {
    return []
  }

  const search = namePrefix.toLowerCase()
  let cities = BRAZILIAN_CITIES

  // Filtra por estado se fornecido
  if (stateCode) {
    cities = cities.filter(city => city.state === stateCode.toUpperCase())
  }

  // Filtra por nome
  return cities
    .filter(city => city.name.toLowerCase().includes(search))
    .slice(0, 10)
}
