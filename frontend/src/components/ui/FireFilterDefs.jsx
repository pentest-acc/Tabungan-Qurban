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
        {/* Avatar besar */}
        <FireFilter
          id="api-fire-lg"
          baseFrequency="0.04 0.045"
          octaves={3}
          scale={13}
          freqValues="0.04 0.045; 0.046 0.06; 0.036 0.04; 0.04 0.045"
          seedValues="2;7;4;9;1;6;2"
          seedDur="1.1s"
        />
        <FireFilter
          id="api-fire-lg2"
          baseFrequency="0.035 0.05"
          octaves={3}
          scale={19}
          freqValues="0.035 0.05; 0.04 0.066; 0.03 0.045; 0.035 0.05"
          seedValues="5;1;8;3;9;5"
          seedDur="0.9s"
        />
        {/* Avatar kecil */}
        <FireFilter
          id="api-fire-sm"
          baseFrequency="0.07 0.08"
          octaves={2}
          scale={6}
          freqValues="0.07 0.08; 0.08 0.1; 0.062 0.072; 0.07 0.08"
          seedValues="2;7;4;9;1;6;2"
          seedDur="1s"
        />
        <FireFilter
          id="api-fire-sm2"
          baseFrequency="0.06 0.09"
          octaves={2}
          scale={9}
          freqValues="0.06 0.09; 0.07 0.11; 0.05 0.08; 0.06 0.09"
          seedValues="5;1;8;3;9;5"
          seedDur="0.8s"
        />
      </defs>
    </svg>
  );
}
