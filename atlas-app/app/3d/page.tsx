import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import Heritage3DGallery from './heritage-3d-gallery'
import Temple3DFrame from './temple-3d-frame'

// India in 3D — high-detail, ZOOMABLE photogrammetry scans of real heritage sites
// (Ellora, Khajuraho, Konark, Thanjavur, Ajanta, Hampi) via Sketchfab: drag to orbit,
// scroll/pinch to zoom into the carving, pan. The parametric temple builder (the handoff
// Three.js stage — Nagara/Dravida/Kalinga, OBJ/GLB export) sits below as the 'how a tower
// is generated' explainer.
export const metadata: Metadata = {
  title: 'Heritage in 3D — high-detail, zoomable scans · Bharat',
  description:
    'Walk around India’s heritage in high-detail 3D: real photogrammetry scans of Ellora, Khajuraho, Konark, Thanjavur, Ajanta and Hampi — drag to orbit, scroll or pinch to zoom right into the stone. Plus a parametric temple builder.',
}

export default function ThreeDPage() {
  return (
    <>
      <SiteHeader />
      <Heritage3DGallery />
      <Temple3DFrame />
      <SiteFooter />
    </>
  )
}
