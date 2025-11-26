export interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

/**
 * Busca endereço pelo CEP usando a API ViaCEP
 */
export const fetchAddressByCEP = async (cep: string): Promise<ViaCEPResponse> => {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)

  if (!response.ok) {
    throw new Error('Erro ao buscar CEP')
  }

  const data: ViaCEPResponse = await response.json()

  if (data.erro) {
    throw new Error('CEP não encontrado')
  }

  return data
}
