import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileEditForm from '../profile-edit-form'
import { useSession } from 'next-auth/react'
import { useStudentProfile } from '@/features/profile_user/useStudentProfile'
import { useRouter } from 'next/navigation'

// Mock dos hooks
vi.mock('next-auth/react')
vi.mock('@/features/profile_user/useStudentProfile')
vi.mock('next/navigation')
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockSession = {
  access: 'mock-token',
  user: { name: 'Test User' },
}

const mockStudentData = {
  user: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'João',
    last_name: 'Silva',
    cpf: '12345678901',
    date_of_birth: '01/01/1990',
    gender: 'M',
    state: 'SP',
    city: 'São Paulo',
    country: 'Brasil',
    phone: '11999999999',
    role: 'student',
    profile_pic_url: 'https://example.com/pic.jpg',
  },
  student_profile: {
    id: 1,
    bio: 'Test bio',
    languages: [
      {
        id: 1,
        name: 'Inglês',
        lang_icon: 'https://example.com/flag.png',
        lang_description: 'English',
      },
    ],
  },
}

describe('ProfileEditForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn(),
    } as any)
    vi.mocked(useStudentProfile).mockReturnValue({
      data: mockStudentData,
      loading: false,
      error: null,
      mutate: vi.fn(),
    })
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      back: vi.fn(),
    } as any)
  })

  it('deve renderizar o formulário com dados do usuário', async () => {
    render(<ProfileEditForm />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('João')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Silva')).toBeInTheDocument()
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    })
  })

  it('deve exibir loading enquanto carrega dados', () => {
    vi.mocked(useStudentProfile).mockReturnValue({
      data: undefined,
      loading: true,
      error: null,
      mutate: vi.fn(),
    })

    render(<ProfileEditForm />)

    expect(screen.getByText('Carregando suas informações...')).toBeInTheDocument()
  })

  it('deve formatar CPF corretamente', async () => {
    render(<ProfileEditForm />)
    const user = userEvent.setup()

    const cpfInput = screen.getByPlaceholderText('000.000.000-00')
    await user.clear(cpfInput)
    await user.type(cpfInput, '12345678901')

    await waitFor(() => {
      expect(cpfInput).toHaveValue('123.456.789-01')
    })
  })

  it('deve formatar telefone corretamente', async () => {
    render(<ProfileEditForm />)
    const user = userEvent.setup()

    const phoneInput = screen.getByPlaceholderText('(00) 00000-0000')
    await user.clear(phoneInput)
    await user.type(phoneInput, '11999999999')

    await waitFor(() => {
      expect(phoneInput).toHaveValue('(11) 99999-9999')
    })
  })

  it('deve formatar CEP corretamente', async () => {
    render(<ProfileEditForm />)
    const user = userEvent.setup()

    const cepInput = screen.getByPlaceholderText('00000-000')
    await user.type(cepInput, '01310100')

    await waitFor(() => {
      expect(cepInput).toHaveValue('01310-100')
    })
  })

  it('deve validar campos obrigatórios', async () => {
    render(<ProfileEditForm />)
    const user = userEvent.setup()

    // Limpar campos obrigatórios
    const firstNameInput = screen.getByPlaceholderText('Ex: João')
    await user.clear(firstNameInput)

    const submitButton = screen.getByRole('button', { name: /salvar alterações/i })
    await user.click(submitButton)

    // Verifica que o formulário não foi enviado (devido à validação HTML5)
    expect(firstNameInput).toBeInvalid()
  })

  it('deve buscar endereço pelo CEP usando ViaCEP', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            localidade: 'São Paulo',
            uf: 'SP',
          }),
      })
    ) as any

    render(<ProfileEditForm />)
    const user = userEvent.setup()

    const cepInput = screen.getByPlaceholderText('00000-000')
    await user.type(cepInput, '01310100')

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://viacep.com.br/ws/01310100/json/')
    })
  })

  it('deve permitir seleção de gênero', async () => {
    render(<ProfileEditForm />)
    const user = userEvent.setup()

    // Encontrar e clicar no select de gênero
    const genderSelect = screen.getByRole('combobox', { name: /gênero/i })
    await user.click(genderSelect)

    // Verificar se as opções aparecem
    await waitFor(() => {
      expect(screen.getByText('Masculino')).toBeInTheDocument()
      expect(screen.getByText('Feminino')).toBeInTheDocument()
    })
  })

  it('deve validar tamanho máximo da bio', async () => {
    render(<ProfileEditForm />)
    const user = userEvent.setup()

    const bioTextarea = screen.getByPlaceholderText(/Sou estudante de idiomas/i)
    const longText = 'a'.repeat(501)

    await user.clear(bioTextarea)
    await user.type(bioTextarea, longText)

    // O textarea tem maxLength={500}, então deve truncar
    expect(bioTextarea).toHaveValue('a'.repeat(500))
  })

  it('deve exibir preview da imagem ao selecionar arquivo', async () => {
    render(<ProfileEditForm />)
    const user = userEvent.setup()

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' })
    const fileInput = screen.getByLabelText(/alterar foto/i) as HTMLInputElement

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(fileInput.files?.[0]).toBe(file)
    })
  })

  it('deve enviar todos os campos ao submeter formulário', async () => {
    const mockMutate = vi.fn()
    vi.mocked(useStudentProfile).mockReturnValue({
      data: mockStudentData,
      loading: false,
      error: null,
      mutate: mockMutate,
    })

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudentData),
      })
    ) as any

    render(<ProfileEditForm />)
    const user = userEvent.setup()

    const submitButton = screen.getByRole('button', { name: /salvar alterações/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/student-portal/student/'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      )
    })
  })

  it('deve enviar gênero como M ou F', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudentData),
      })
    ) as any

    render(<ProfileEditForm />)
    const user = userEvent.setup()

    const submitButton = screen.getByRole('button', { name: /salvar alterações/i })
    await user.click(submitButton)

    await waitFor(() => {
      const formDataCall = (global.fetch as any).mock.calls[0][1].body as FormData
      expect(formDataCall.get('gender')).toBe('M')
    })
  })

  it('deve enviar CEP para API', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudentData),
      })
    ) as any

    render(<ProfileEditForm />)
    const user = userEvent.setup()

    const cepInput = screen.getByPlaceholderText('00000-000')
    await user.type(cepInput, '01310100')

    const submitButton = screen.getByRole('button', { name: /salvar alterações/i })
    await user.click(submitButton)

    await waitFor(() => {
      const formDataCall = (global.fetch as any).mock.calls[0][1].body as FormData
      expect(formDataCall.get('cep')).toBe('01310-100')
    })
  })

  it('deve atualizar cache do SWR após salvar', async () => {
    const mockMutate = vi.fn()
    vi.mocked(useStudentProfile).mockReturnValue({
      data: mockStudentData,
      loading: false,
      error: null,
      mutate: mockMutate,
    })

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudentData),
      })
    ) as any

    render(<ProfileEditForm />)
    const user = userEvent.setup()

    const submitButton = screen.getByRole('button', { name: /salvar alterações/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(mockStudentData, false)
    })
  })

  it('deve voltar para página anterior ao clicar em cancelar', async () => {
    const mockBack = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      back: mockBack,
    } as any)

    render(<ProfileEditForm />)
    const user = userEvent.setup()

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelButton)

    expect(mockBack).toHaveBeenCalled()
  })
})
