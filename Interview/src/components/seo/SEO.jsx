import { useEffect } from 'react'
import { applySeo, resetSeoToDocumentDefaults } from '../../seo/seoManager'
import { getSeoConfig } from '../../seo/seoConfig'

export default function SEO({ path }) {
  useEffect(() => {
    const config = getSeoConfig(path)
    applySeo(config)

    return () => {
      resetSeoToDocumentDefaults()
    }
  }, [path])

  return null
}
