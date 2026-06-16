// Filter turbulensi SVG untuk bingkai avatar "Api".
// Teknik: sebuah PITA api (radial-gradient putih-panas -> kuning -> oranye ->
// merah) dirobek menjadi lidah-lidah api organik oleh feDisplacementMap yang
// digerakkan feTurbulence. Animasi seed/baseFrequency membuat api berkedip &
// menari seperti nyala sungguhan.
//
// Skala perpindahan SVG bersatuan piksel TETAP, sehingga disediakan 2 tingkat:
//  - "sm" untuk avatar kecil (navbar/daftar/preview)
//  - "lg" untuk avatar besar (kartu profil/modal)
// Masing-masing punya lapis utama + lapis "tall" (lidah lebih tinggi).
// Dirender SEKALI di DashboardLayout lalu dirujuk via CSS `filter: url(#id)`.

function FireFilter({ id, baseFrequency, octaves, scale, freqValues, seedValues, seedDur }) {
  return (
    <filter id={id} x="-70%" y="-70%" width="240%" height="240%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency={baseFrequency} numOctaves={octaves} seed="7" result="noise">
        <animate attributeName="baseFrequency" dur="4.5s" values={freqValues} repeatCount="indefinite" />
        <animate attributeName="seed" dur={seedDur} values={seedValues} calcMode="discrete" repeatCount="indefinite" />
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
}

export default function FireFilterDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        {/* Avatar besar — frekuensi tinggi (lidah halus) + skala kecil (ramping) */}
        <FireFilter
          id="api-fire-lg"
          baseFrequency="0.13 0.15"
          octaves={3}
          scale={7}
          freqValues="0.13 0.15; 0.15 0.19; 0.11 0.13; 0.13 0.15"
          seedValues="2;7;4;9;1;6;2"
          seedDur="0.9s"
        />
        <FireFilter
          id="api-fire-lg2"
          baseFrequency="0.11 0.14"
          octaves={3}
          scale={9}
          freqValues="0.11 0.14; 0.13 0.18; 0.09 0.12; 0.11 0.14"
          seedValues="5;1;8;3;9;5"
          seedDur="0.75s"
        />
        {/* Avatar kecil */}
        <FireFilter
          id="api-fire-sm"
          baseFrequency="0.22 0.25"
          octaves={2}
          scale={4}
          freqValues="0.22 0.25; 0.25 0.3; 0.19 0.22; 0.22 0.25"
          seedValues="2;7;4;9;1;6;2"
          seedDur="0.85s"
        />
        <FireFilter
          id="api-fire-sm2"
          baseFrequency="0.2 0.26"
          octaves={2}
          scale={5}
          freqValues="0.2 0.26; 0.24 0.31; 0.17 0.23; 0.2 0.26"
          seedValues="5;1;8;3;9;5"
          seedDur="0.7s"
        />
      </defs>
    </svg>
  );
}
