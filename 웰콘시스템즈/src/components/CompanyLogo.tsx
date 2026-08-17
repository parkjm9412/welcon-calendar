import logoColor from '@/imports/___4.png'
import logoWhite from '@/imports/welcon___.png'
import logoMark from '@/imports/______.png'

interface Props {
  variant?: 'color' | 'white' | 'mark'
  height?: number
  style?: React.CSSProperties
}

export default function CompanyLogo({ variant = 'color', height = 32, style }: Props) {
  const src = variant === 'white' ? logoWhite : variant === 'mark' ? logoMark : logoColor
  const alt = 'Welcon Systems'

  return (
    <img
      src={src}
      alt={alt}
      style={{
        height,
        width: 'auto',
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
    />
  )
}
