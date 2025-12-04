# 🎯 Tour Interativo da Página de Curso

Tour moderno e interativo para guiar novos usuários pela página `/course/[id]`, inspirado em plataformas como Rocketseat.

## 📦 Tecnologias Utilizadas

- **Driver.js** - Biblioteca leve e moderna para tours interativos
- **React** + **Next.js 15**
- **TypeScript**
- **Tailwind CSS** - Estilos customizados com dark mode
- **shadcn/ui** - Componentes base

## ✨ Funcionalidades

- ✅ Inicialização automática na primeira visita
- ✅ Botão flutuante para refazer o tour
- ✅ 7 etapas guiadas
- ✅ Animações suaves
- ✅ Destaque com blur + spotlight
- ✅ Botões "Próximo" e "Anterior"
- ✅ Barra de progresso
- ✅ Dark mode automático
- ✅ Totalmente responsivo
- ✅ Persistência com localStorage

## 🎨 Estrutura de Arquivos

```
src/
├── app/(private)/course/[id]/
│   ├── page.tsx                    # Página do curso (tour integrado)
│   └── layout.tsx                  # Layout com importação dos estilos
├── features/lessons/
│   ├── components/
│   │   ├── course-tour.tsx         # Componente principal do tour
│   │   ├── lesson-rating.tsx       # Atributo data-tour="mark-watched"
│   │   ├── lesson-sidebar-tabs.tsx # Atributo data-tour="lesson-sidebar"
│   │   └── video-player.tsx        # Usado em data-tour="video-player"
│   └── styles/
│       └── course-tour.css         # Estilos customizados
```

## 🚀 Como Usar

### Integração Básica

O tour já está integrado na página `/course/[id]`. Ele aparece automaticamente na primeira visita do usuário.

```tsx
import { CourseTour } from '@/src/features/lessons/components/course-tour'

export default function CoursePage() {
  return (
    <>
      {/* Tour aparece automaticamente na primeira visita */}
      <CourseTour />

      {/* Restante do conteúdo */}
    </>
  )
}
```

### Uso Programático

Use o hook `useCourseTour` para controlar o tour via código:

```tsx
'use client'

import { useCourseTour } from '@/src/features/lessons/components/course-tour'

export function MyComponent() {
  const { startTour, resetTour } = useCourseTour()

  return (
    <>
      {/* Iniciar o tour manualmente */}
      <button onClick={startTour}>
        Ver tutorial
      </button>

      {/* Resetar (limpar localStorage e recarregar) */}
      <button onClick={resetTour}>
        Resetar tour
      </button>
    </>
  )
}
```

### Props do Componente

```tsx
interface CourseTourProps {
  /** Executar o tour automaticamente na primeira visita (padrão: true) */
  autoStart?: boolean

  /** Callback quando o tour é concluído */
  onComplete?: () => void

  /** Callback quando o tour é pulado */
  onSkip?: () => void
}

// Exemplo
<CourseTour
  autoStart={true}
  onComplete={() => console.log('Tour concluído!')}
  onSkip={() => console.log('Tour pulado')}
/>
```

## 📝 Etapas do Tour

O tour possui 7 etapas que guiam o usuário pelos principais elementos da página:

| Etapa | Elemento | Descrição |
|-------|----------|-----------|
| 1 | `body` | Boas-vindas e introdução |
| 2 | `[data-tour="video-player"]` | Player de vídeo e controles |
| 3 | `[data-tour="lesson-sidebar"]` | Lista de aulas por módulo |
| 4 | `[data-tour="lesson-description"]` | Informações e avaliação da aula |
| 5 | `[data-tour="mark-watched"]` | Botão marcar como assistida |
| 6 | `[data-tour="lesson-sidebar"]` | Material de apoio |
| 7 | `body` | Finalização e incentivo |

## ✏️ Como Adicionar/Editar Etapas

### 1. Adicionar uma Nova Etapa

Edite o arquivo `src/features/lessons/components/course-tour.tsx`:

```tsx
steps: [
  // ... etapas existentes
  {
    element: '[data-tour="seu-elemento"]',
    popover: {
      title: '🎯 Título da Etapa',
      description: 'Descrição clara do que o usuário deve aprender.',
      side: 'bottom',    // top | bottom | left | right
      align: 'start',    // start | center | end
    },
  },
]
```

### 2. Adicionar Atributo data-tour em um Componente

Em qualquer componente que você queira destacar no tour:

```tsx
<div data-tour="meu-novo-elemento">
  {/* Seu conteúdo */}
</div>
```

### 3. Remover uma Etapa

Simplesmente remova o objeto correspondente do array `steps` no componente `CourseTour`.

## 🎨 Personalização de Estilos

Os estilos estão em `src/features/lessons/styles/course-tour.css`.

### Exemplo de Customização

```css
/* Mudar cor primária do tour */
.tour-popover .driver-popover-next-btn {
  background: hsl(var(--your-custom-color));
}

/* Mudar tamanho do popover */
.tour-popover.driver-popover {
  max-width: 500px;
}

/* Customizar highlight */
.driver-active-element {
  outline-color: #your-color !important;
}
```

## 🌙 Dark Mode

O tour automaticamente se adapta ao tema (light/dark) usando CSS variables do Tailwind:

- `hsl(var(--background))` - Fundo dos popovers
- `hsl(var(--foreground))` - Texto principal
- `hsl(var(--primary))` - Cor de destaque
- `hsl(var(--border))` - Bordas

## 📱 Responsividade

O tour é totalmente responsivo:

- **Desktop**: Popover com largura máxima de 400px
- **Mobile**: Popover adapta-se ao viewport (100vw - 2rem)
- Botões em linha no desktop, empilhados no mobile
- Ajustes automáticos de posicionamento

## 🔧 Configurações Avançadas

### Alterar Tempo de Delay Inicial

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    startTour()
  }, 2000) // Aumentar de 1000ms para 2000ms

  return () => clearTimeout(timer)
}, [autoStart])
```

### Desabilitar Animações

```tsx
const driverObj = driver({
  animate: false,
  smoothScroll: false,
  // ... outras configs
})
```

### Mudar Opacidade do Overlay

```tsx
const driverObj = driver({
  overlayOpacity: 0.9, // 0.0 a 1.0
  // ... outras configs
})
```

## 🧪 Testando o Tour

### Resetar o Tour Localmente

Abra o DevTools Console e execute:

```javascript
localStorage.removeItem('course-tour-completed')
location.reload()
```

Ou use o botão "Refazer tour" no canto inferior direito.

## 📌 Notas Importantes

1. **Persistência**: O tour usa `localStorage` com a chave `course-tour-completed`
2. **Performance**: O tour carrega os estilos CSS apenas quando necessário
3. **Acessibilidade**: Todos os botões têm `aria-label` apropriado
4. **Compatibilidade**: Funciona em todos os navegadores modernos

## 🐛 Troubleshooting

### Tour não aparece

- Verifique se `localStorage.getItem('course-tour-completed')` é `null`
- Certifique-se que os elementos com `data-tour` estão renderizados
- Verifique o console para erros

### Elementos não são destacados

- Confirme que o atributo `data-tour` está correto
- Verifique se o elemento está visível na página
- O elemento pode estar dentro de um componente não renderizado

### Estilos não aplicados

- Confirme que `course-tour.css` está importado no layout
- Verifique se não há conflitos de CSS com outras bibliotecas
- Limpe o cache do navegador

## 📚 Recursos

- [Driver.js Docs](https://driverjs.com/)
- [Exemplo ao vivo](http://localhost:3000/course/[id])

## 🎉 Pronto!

Agora você tem um tour interativo moderno e totalmente funcional. Para qualquer dúvida, consulte o código-fonte em `src/features/lessons/components/course-tour.tsx`.
