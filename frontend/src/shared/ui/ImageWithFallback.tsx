import { useState } from "react";

const FALLBACK_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' fill='%23e5e5ea'%3E%3Crect width='200' height='200' rx='8'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.35em' font-size='14' fill='%23a0a0a8' font-family='sans-serif'%3ENo image%3C/text%3E%3C/svg%3E";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

/**
 * An `<img>` wrapper that shows a fallback placeholder when
 * the image fails to load. Also defers loading by default.
 */
export default function ImageWithFallback({
  fallbackSrc = FALLBACK_SRC,
  onError,
  loading = "lazy",
  alt = "",
  ...rest
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  return (
    <img
      {...rest}
      alt={alt}
      loading={loading}
      src={failed ? fallbackSrc : rest.src}
      onError={(e) => {
        if (!failed) setFailed(true);
        onError?.(e);
      }}
    />
  );
}
