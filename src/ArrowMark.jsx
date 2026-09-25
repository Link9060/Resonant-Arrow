import React from 'react';

export const ARROW_MARK_PATH = 'M3 5.2 21 12 3 18.8 8.2 12 3 5.2Z';

export function ArrowMark({ size = 24, className = '', style, title }) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d={ARROW_MARK_PATH} fill="currentColor" />
    </svg>
  );
}
