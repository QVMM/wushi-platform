interface Props {
  size?: number | string
  className?: string
  title?: string
}

/** 在线醒狮图标（扁平矢量风），用于顶栏与品牌位 */
export function LogoMark({ size = 32, className = '', title = '狮舞教学平台' }: Props) {
  const px = typeof size === 'number' ? size : undefined
  return (
    <img
      src="/logo-color.png"
      width={px}
      height={px}
      alt={title}
      draggable={false}
      className={`inline-block rounded-[22%] object-cover shadow-sm shadow-black/30 ${className}`}
      style={px ? undefined : { width: size, height: size }}
    />
  )
}
