
import { useState, useEffect, useRef } from "react"
import "./LazyImage.css"

const LazyImage = ({ src, alt, className = "", placeholderSrc = null }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.disconnect()
      }
    }
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const defaultPlaceholder = `https://via.placeholder.com/300x300?text=${encodeURIComponent(alt || "Loading...")}`
  const placeholder = placeholderSrc || defaultPlaceholder

  return (
    <div ref={imgRef} className={`lazy-image-container ${className}`}>
      {isInView && (
        <>
          <img
            src={src || "/placeholder.svg"}
            alt={alt}
            className={`lazy-image ${isLoaded ? "loaded" : "loading"}`}
            onLoad={handleLoad}
          />
          {!isLoaded && (
            <img src={placeholder || "/placeholder.svg"} alt={`Loading ${alt}`} className="lazy-image-placeholder" />
          )}
        </>
      )}
      {!isInView && (
        <img src={placeholder || "/placeholder.svg"} alt={`Loading ${alt}`} className="lazy-image-placeholder" />
      )}
    </div>
  )
}

export default LazyImage
