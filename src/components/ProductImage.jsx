import { useState } from 'react';

/**
 * Product photo with an offline fallback: if the remote image can't load
 * (no internet, CDN down), a local placeholder from /images is shown instead.
 */
export default function ProductImage({ src, productId, alt = '', className = '', ...rest }) {
  const fallback = `/images/${productId}.svg`;
  const [current, setCurrent] = useState(src || fallback);
  return (
    <img
      src={current}
      alt={alt}
      className={`product-img ${className}`}
      loading="lazy"
      onError={() => current !== fallback && setCurrent(fallback)}
      {...rest}
    />
  );
}
