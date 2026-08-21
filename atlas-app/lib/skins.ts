// The skin catalog — plain data (no 'use client'), so BOTH server and client
// components can import it. The switcher, the header, the gallery and the home brand
// strip all read this one list. Each skin is a token layer over the shared chassis.
export type Skin = { id: string; label: string; note: string; swatch: string; band: string }

export const SKINS: Skin[] = [
  { id: 'gupta', label: 'Gupta', note: 'the warm default — stone & house gold', swatch: '#cc8900', band: '#cc8900' },
  { id: 'chassis', label: 'Modernist', note: 'the bare structural chassis — red on grey', swatch: '#ec3013', band: '#ec3013' },
  { id: 'kashmir', label: 'Kashmir', note: 'valley stone · saffron · trefoil', swatch: '#d98a2b', band: '#6e7f8c' },
  { id: 'rajasthan', label: 'Rajasthan', note: 'pink sandstone · leheriya · indigo', swatch: '#c9345a', band: '#2a4a7a' },
  { id: 'tamil', label: 'Tamil Nadu', note: 'granite · kumkum · temple gold', swatch: '#a8322b', band: '#c9862b' },
  { id: 'kerala', label: 'Kerala', note: 'backwater green · coir · brass', swatch: '#2f7d4f', band: '#b8863b' },
  { id: 'assam', label: 'Assam', note: 'gamosa weave · red border · green', swatch: '#c0392b', band: '#3f6b45' },
  { id: 'naga', label: 'Nagaland', note: 'Naga shawl bands · loom red', swatch: '#b3271f', band: '#201a16' },
]
