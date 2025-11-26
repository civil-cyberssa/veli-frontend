import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

import { useSession } from 'next-auth/react'
import { SWRConfig } from 'swr'
import { useStudentProfile } from '@/src/features/profile'

// Mock do useSession
vi.mock('next-auth/react')

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
    languages: [],
  },
}

describe('useStudentProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar loading true inicialmente', () => {
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn(),
    } as any)

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudentData),
      })
    ) as any

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0 }}>{children}</SWRConfig>
    )

    const { result } = renderHook(() => useStudentProfile(), { wrapper })

    expect(result.current.loading).toBe(true)
  })

  it('deve buscar dados do estudante quando autenticado', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn(),
    } as any)

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudentData),
      })
    ) as any

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0 }}>{children}</SWRConfig>
    )

    const { result } = renderHook(() => useStudentProfile(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockStudentData)
    expect(result.current.error).toBeNull()
  })

  it('não deve fazer requisição se não estiver autenticado', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    } as any)

    global.fetch = vi.fn()

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0 }}>{children}</SWRConfig>
    )

    renderHook(() => useStudentProfile(), { wrapper })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('deve retornar erro em caso de falha na requisição', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn(),
    } as any)

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    ) as any

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0 }}>{children}</SWRConfig>
    )

    const { result } = renderHook(() => useStudentProfile(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })
  })

  it('deve incluir token de autorização no header', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn(),
    } as any)

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudentData),
      })
    ) as any

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0 }}>{children}</SWRConfig>
    )

    renderHook(() => useStudentProfile(), { wrapper })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/student-portal/student/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      )
    })
  })

  it('deve expor função mutate para atualização de dados', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn(),
    } as any)

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudentData),
      })
    ) as any

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0 }}>{children}</SWRConfig>
    )

    const { result } = renderHook(() => useStudentProfile(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(typeof result.current.mutate).toBe('function')
  })
})
