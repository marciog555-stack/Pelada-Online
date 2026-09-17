import { useId } from 'react'

// Taça desenhada do zero (silhueta genérica de troféu esportivo), não uma
// cópia de nenhum troféu oficial de liga/confederação - evita qualquer
// problema de marca registrada enquanto ainda comunica "taça de futebol".
// É o único ícone de "conquista" usado no app - tanto na vitrine de taças
// do perfil quanto na lista de campeões da liga - pra manter a mesma
// identidade visual em vez de misturar com o ícone genérico do lucide-react.
export function TrophyCup({
  size = 64,
  earned,
  className,
}: {
  size?: number
  earned: boolean
  className?: string
}) {
  const gradientId = useId()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 76"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {earned && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe08a" />
            <stop offset="55%" stopColor="#f0b429" />
            <stop offset="100%" stopColor="#b9800f" />
          </linearGradient>
        </defs>
      )}
      {/* alças */}
      <path
        d="M15 12 C4 12 3 27 13 32 C15.5 33.3 18 33.6 20 33.2"
        stroke={earned ? `url(#${gradientId})` : 'currentColor'}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M49 12 C60 12 61 27 51 32 C48.5 33.3 46 33.6 44 33.2"
        stroke={earned ? `url(#${gradientId})` : 'currentColor'}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* taça */}
      <path
        d="M14 8 H50 V24 C50 40 39 47 32 47 C25 47 14 40 14 24 Z"
        fill={earned ? `url(#${gradientId})` : 'currentColor'}
      />
      {/* brilho */}
      {earned && <path d="M20 12 C19 20 20 27 24 32" stroke="#fff5d6" strokeWidth="2" opacity="0.6" strokeLinecap="round" />}
      {/* pé */}
      <path d="M29 47 H35 L37 58 H27 Z" fill={earned ? `url(#${gradientId})` : 'currentColor'} />
      {/* base */}
      <rect x="18" y="58" width="28" height="5" rx="1.5" fill={earned ? `url(#${gradientId})` : 'currentColor'} />
      <rect x="13" y="64" width="38" height="6" rx="1.5" fill={earned ? `url(#${gradientId})` : 'currentColor'} />
    </svg>
  )
}
