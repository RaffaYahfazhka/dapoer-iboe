import React from 'react'

interface IconProps {
  name: string
  className?: string
  size?: number | string
  filled?: boolean
  title?: string
}

export default function Icon({
  name,
  className = '',
  size = 24,
  filled = false,
  title,
}: IconProps) {
  const sizeStyle = typeof size === 'number' ? `${size}px` : size

  return (
    <span
      className={`material-symbols-rounded select-none leading-none ${filled ? 'filled' : ''} ${className}`}
      style={{ fontSize: sizeStyle }}
      title={title}
      aria-hidden={title ? undefined : true}
    >
      {name}
    </span>
  )
}
