import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import Temple3DFrame from './temple-3d-frame'

// Temple 3D — the handoff's Bharat Temple 3D.html served as-is (a self-contained
// Three.js <three-d-stage> that builds parametric Nagara / Dravida / Kalinga temples,
// with OrbitControls, autorotate and OBJ/GLB export). Embedded here inside the app
// chrome; the page itself lives at public/temple3d/.
export const metadata: Metadata = {
  title: 'Temple in 3D — parametric Nagara · Dravida · Kalinga · Bharat',
  description:
    'Three temple towers built parametrically in real 3D — the latina curve of a Nagara shikhara, a Dravida vimana, a Kalinga deul — rotatable, and exportable to Blender as OBJ/GLB.',
}

export default function ThreeDPage() {
  return (
    <>
      <SiteHeader />
      <Temple3DFrame />
      <SiteFooter />
    </>
  )
}
