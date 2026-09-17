import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VideoPlayer } from '../video-player'


describe('VideoPlayer captions', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    )
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined)
  })

  it('permite ativar e desativar uma legenda publicada', async () => {
    const user = userEvent.setup()
    render(
      <VideoPlayer
        url="https://example.com/lesson.mp4"
        caption={{
          language: 'pt-BR',
          label: 'Português',
          position_percent: 42,
          text_color: '#FACC15',
          cues: [{ start_ms: 0, end_ms: 1500, text: 'Bem-vindos à aula.' }],
        }}
      />
    )

    const toggle = screen.getByRole('button', { name: 'Ativar legendas' })
    expect(screen.queryByText('Bem-vindos à aula.')).not.toBeInTheDocument()

    await user.click(toggle)
    const captionText = screen.getByText('Bem-vindos à aula.')
    expect(captionText).toBeInTheDocument()
    expect(captionText).toHaveStyle({ color: '#FACC15' })
    expect(captionText.parentElement).toHaveStyle({ bottom: '42%' })
    expect(screen.getByRole('button', { name: 'Desativar legendas' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    await user.click(screen.getByRole('button', { name: 'Desativar legendas' }))
    expect(screen.queryByText('Bem-vindos à aula.')).not.toBeInTheDocument()
  })

  it('exibe cada trecho somente durante o intervalo correspondente do vídeo', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <VideoPlayer
        url="https://example.com/lesson.mp4"
        caption={{
          language: 'pt-BR',
          label: 'Português',
          position_percent: 14,
          text_color: '#FFFFFF',
          cues: [{ start_ms: 1000, end_ms: 2500, text: 'Trecho sincronizado.' }],
        }}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Ativar legendas' }))
    expect(screen.queryByText('Trecho sincronizado.')).not.toBeInTheDocument()

    const video = container.querySelector('video')
    expect(video).not.toBeNull()

    if (video) {
      video.currentTime = 1.5
      fireEvent.timeUpdate(video)
    }

    expect(screen.getByText('Trecho sincronizado.')).toBeInTheDocument()

    if (video) {
      video.currentTime = 3
      fireEvent.timeUpdate(video)
    }

    expect(screen.queryByText('Trecho sincronizado.')).not.toBeInTheDocument()
  })

  it('não exibe o controle quando a aula não possui legendas', () => {
    render(<VideoPlayer url="https://example.com/lesson-without-captions.mp4" />)

    expect(screen.queryByRole('button', { name: 'Ativar legendas' })).not.toBeInTheDocument()
  })
})
