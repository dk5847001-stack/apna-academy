import { useEffect } from 'react'
import { applySeo, resetSeoToDocumentDefaults } from '../../seo/seoManager'
import { getSeoConfig } from '../../seo/seoConfig'
import { applyStructuredData, removeStructuredData } from '../../seo/structuredData'

export default function SEO({ path }) {
  useEffect(() => {
    const config = getSeoConfig(path)
    applySeo(config)
    applyStructuredData(config)

    return () => {
      removeStructuredData()
      resetSeoToDocumentDefaults()
    }
  }, [path])

  return null
}
