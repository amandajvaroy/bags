import { useState, useRef, useEffect } from 'react'
import veske from './assets/veske.png'
import './index.css'

import Boot      from './assets/boot.png'
import Bringebær from './assets/bringebaer.png'
import Solbriller from './assets/solbriller.png'
import Cowboyhat  from './assets/cowboyhat.png'
import Dermo     from './assets/Dermo.png'
import Fly       from './assets/Fly.png'
import Hudkrem   from './assets/Hudkrem.png'
import Snus      from './assets/Snus.png'
import Sovemaske from './assets/Sovemaske.png'
import Sunscreen from './assets/Sunscreen.png'
import Champis   from './assets/champis.png'
import Disco     from './assets/disco.png'
import Lighter   from './assets/lighter.png'
import Lipgloss  from './assets/lipgloss_2.png'
import Musikk    from './assets/musikk.png'
import Vector    from './assets/Vector.png'
import Oliven    from './assets/oliven.png'

// h = høyde i forhold til bredde (aspektforhold)
const baseItems = [
  { id: 'fly',       src: Fly,        alt: 'Flybillett',    size: 'w-[262px]', h: 0.55, message: 'Alltid klar for tur!'            },
  { id: 'disco',     src: Disco,      alt: 'Disco ball',    size: 'w-[152px]', h: 1.0,  message: 'Voulez-vous 🎵💃🏼'              },
  { id: 'champis',   src: Champis,    alt: 'Champagne',     size: 'w-[107px]', h: 3.4,  message: 'Crémant <3'                      },
  { id: 'snus',      src: Snus,       alt: 'Snus',          size: 'w-[101px]', h: 1.0,  message: 'love'                            },
  { id: 'sovemaske', src: Sovemaske,  alt: 'Sovemaske',     size: 'w-[222px]', h: 0.5,  message: 'Søvn <3'                         },
  { id: 'lipgloss',  src: Lipgloss,   alt: 'Lipgloss',      size: 'w-[107px]', h: 2.4,  message: 'Beste lip plumer'                },
  { id: 'lighter',   src: Lighter,    alt: 'Lighter',       size: 'w-[50px]',  h: 2.8,  message: 'Sørg for at ingenting tar fyr.'  },
  { id: 'hudkrem',   src: Hudkrem,    alt: 'Hudkrem',       size: 'w-[142px]', h: 0.75, message: 'Perfekt under sminke'            },
  { id: 'musikk',    src: Musikk,     alt: 'Hodetelefoner', size: 'w-[181px]', h: 0.9,  message: 'ABBA all the way'                },
  { id: 'oliven',    src: Oliven,     alt: 'Oliven',        size: 'w-[161px]', h: 0.75, message: 'mmmmm'                           },
  { id: 'dermo',     src: Dermo,      alt: 'Dermalogica',   size: 'w-[101px]', h: 1.5,  message: 'Gir silkemyk hud'                },
  { id: 'sunscreen', src: Sunscreen,  alt: 'Solkrem',       size: 'w-[120px]', h: 2.0,  message: 'Elsker denne solkremen'          },
  { id: 'vector',    src: Vector,     alt: 'Børste',        size: 'w-[121px]', h: 0.85, message: 'Dry brushing <3'                 },
  { id: 'boot',      src: Boot,       alt: 'Boot',          size: 'w-[195px]', h: 1.2,  message: 'Stolt tecovas eier'              },
  { id: 'bringebær', src: Bringebær,  alt: 'Bringebær',     size: 'w-[180px]', h: 0.8,  message: 'Bringebær, mine favoritter'      },
  { id: 'solbriller',src: Solbriller, alt: 'Solbriller',    size: 'w-[210px]', h: 0.45, message: 'Shaaady'                         },
  { id: 'cowboyhat', src: Cowboyhat,  alt: 'Cowboyhatt',    size: 'w-[240px]', h: 0.65, message: 'Yiha'                            },
]

function getScale() {
  return Math.min(1, window.innerWidth / 750)
}

function randomPositions() {
  const vw     = window.innerWidth
  const vh     = window.innerHeight
  const scale  = getScale()
  const placed = []

  const sorted = [...baseItems].sort((a, b) => {
    const aArea = parseInt(a.size.match(/\d+/)[0]) ** 2 * a.h + Math.random() * 3000
    const bArea = parseInt(b.size.match(/\d+/)[0]) ** 2 * b.h + Math.random() * 3000
    return bArea - aArea
  })

  return sorted.map(item => {
    const widthPx = parseInt(item.size.match(/\d+/)[0]) * scale
    const wPct    = (widthPx / vw) * 100
    const hPct    = (widthPx * item.h / vh) * 100

    const maxLeft = Math.max(0, 72 - wPct)
    const maxTop  = Math.max(0, 88 - hPct)

    let left, top, attempts = 0, pad = 2

    const overlaps = () =>
      (left > 52 && top > 52) ||                  // veskehjørnet
      placed.some(p => {
        const ox = left < p.left + p.w + pad && left + wPct + pad > p.left
        const oy = top  < p.top  + p.h + pad && top  + hPct + pad > p.top
        return ox && oy
      })

    do {
      if (attempts === 200) pad = 1
      if (attempts === 350) pad = 0
      left = Math.random() * maxLeft + 2
      top  = Math.random() * maxTop  + 2
      attempts++
    } while (attempts < 500 && overlaps())

    placed.push({ left, top, w: wPct, h: hPct })
    return {
      ...item,
      displayWidth: Math.round(widthPx),
      top:    `${top}%`,
      left:   `${left}%`,
      rotate: `${(Math.random() - 0.5) * 28}deg`,
    }
  })
}

function BagItem({ src, alt, displayWidth, top, left, rotate, isVisible, index, message, onZoom }) {
  const [clicked, setClicked]   = useState(false)
  const [showMsg, setShowMsg]   = useState(false)
  const timerRef                = useRef(null)
  const isMobile                = window.innerWidth < 768

  // Skjul melding når vesken lukkes
  useEffect(() => {
    if (!isVisible) {
      setShowMsg(false)
      clearTimeout(timerRef.current)
    }
  }, [isVisible])

  const topVal  = parseFloat(top)
  const leftVal = parseFloat(left)
  const offsetX = `calc(50vw - ${leftVal}vw)`
  const offsetY = `calc(50vh - ${topVal}vh)`

  function handleClick() {
    if (isMobile) {
      onZoom({ src, alt, displayWidth, message })
    } else {
      setClicked(true)
      if (message) {
        setShowMsg(true)
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setShowMsg(false), 5000)
      }
    }
  }

  return (
    <div className="absolute" style={{ top, left }}>
      {/* Meldingsboble (desktop) */}
      {showMsg && (() => {
        const above = topVal > 50
        return (
          <div
            className="absolute left-1/2 z-50 animate-fade-in"
            style={above ? { bottom: 'calc(100% + 2px)' } : { top: 'calc(100% + 2px)' }}
          >
            <div className="relative bg-white border border-stone-200 rounded-2xl px-4 py-2 shadow-md whitespace-nowrap -translate-x-1/2">
              <p className="text-xs text-stone-700 tracking-wide">{message}</p>
              {/* Pil — peker mot produktet */}
              {above ? (
                // Pil ned (boble er over → pil i bunn)
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-2 overflow-hidden">
                  <div className="w-3 h-3 bg-white border-r border-b border-stone-200 rotate-45 -translate-y-1.5 mx-auto" />
                </div>
              ) : (
                // Pil opp (boble er under → pil i topp)
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-3 h-2 overflow-hidden flex justify-center">
                  <div className="w-3 h-3 bg-white border-l border-t border-stone-200 rotate-45 translate-y-1.5" />
                </div>
              )}
            </div>
          </div>
        )
      })()}

      <img
        src={src}
        alt={alt}
        onClick={handleClick}
        onAnimationEnd={() => setClicked(false)}
        className={`cursor-pointer drop-shadow-md select-none
          ${clicked ? 'item-wiggle' : ''}
          ${!clicked && isVisible ? 'hover:scale-110 hover:-translate-y-1' : ''}`}
        style={{
          width: `${displayWidth}px`,
          transform: isVisible
            ? `rotate(${rotate}) scale(1)`
            : `translate(${offsetX}, ${offsetY}) scale(0.2) rotate(${rotate})`,
          opacity: isVisible ? 1 : 0,
          transition: isVisible
            ? `transform 0.65s cubic-bezier(0.34, 1.4, 0.64, 1) ${index * 0.055}s,
               opacity   0.3s ease          ${index * 0.055}s`
            : `transform 0.35s ease-in, opacity 0.25s ease-in`,
        }}
      />
    </div>
  )
}

function ZoomOverlay({ item, onClose }) {
  const [wiggle, setWiggle] = useState(false)
  const imgSize = Math.min(item.displayWidth * 2.5, window.innerWidth * 0.78)

  return (
    <div
      className="fixed z-50 animate-fade-in"
      style={{ inset: 0, backgroundColor: 'rgba(0,0,0,0.08)' }}
      onClick={onClose}
    >
      {/* Sentrert innhold */}
      <div
        className="absolute flex flex-col items-center"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <img
          src={item.src}
          alt={item.alt}
          className={`drop-shadow-2xl cursor-pointer ${wiggle ? 'item-wiggle' : ''}`}
          style={{ width: `${imgSize}px` }}
          onClick={() => setWiggle(true)}
          onAnimationEnd={() => setWiggle(false)}
        />
        {item.message && (
          <p className="mt-4 bg-white rounded-2xl px-5 py-3 text-sm text-stone-700 tracking-wide shadow-md whitespace-nowrap">
            {item.message}
          </p>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [isOpen, setIsOpen]     = useState(false)
  const [items, setItems]       = useState(randomPositions)
  const [zoomedItem, setZoomedItem] = useState(null)

  const isMobile   = window.innerWidth < 768
  const bagSize    = isMobile ? Math.round(window.innerWidth * 0.55) : 384
  const bagOffset  = isMobile ? '22vw' : '38vw'
  const bagVOffset = isMobile ? '30vh' : '38vh'
  const bagScale   = isMobile ? 1.4 : 1.8

  function handleToggle() {
    if (!isOpen) {
      // Sett nye posisjoner først (mens isOpen fortsatt er false),
      // vent to frames så React rekker å rendre startposisjonen,
      // deretter start åpne-animasjonen
      setItems(randomPositions())
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsOpen(true))
      })
    } else {
      setIsOpen(false)
      setZoomedItem(null)
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden grid-bg">

      {/* Tittel */}
      <p className="absolute top-6 left-6 text-sm tracking-wide text-stone-500 z-10 select-none">
        Dette har jeg i vesken
      </p>

      {/* Mobil zoom-overlay */}
      {zoomedItem && <ZoomOverlay item={zoomedItem} onClose={() => setZoomedItem(null)} />}

      {/* Produkter */}
      {items.map((item, i) => (
        <BagItem key={item.id} {...item} isVisible={isOpen} index={i} onZoom={setZoomedItem} />
      ))}

      {/* Veske */}
      <img
        src={veske}
        alt="My bag"
        onClick={handleToggle}
        className="absolute left-1/2 top-1/2 cursor-pointer drop-shadow-xl transition-all duration-700 ease-in-out z-20 hover:brightness-105"
        style={{
          width: `${bagSize}px`,
          transform: isOpen
            ? `translate(calc(-50% + ${bagOffset}), calc(-50% + ${bagVOffset})) rotate(-20deg) scale(${bagScale})`
            : 'translate(-50%, -50%) rotate(0deg) scale(1)',
        }}
      />

      {/* Knapp */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={handleToggle}
          className="px-4 py-1.5 text-xs tracking-widest text-stone-600 border border-stone-400 bg-white/70 backdrop-blur-sm hover:bg-white transition-colors"
        >
          {isOpen ? 'Lukk vesken' : 'Se i vesken'}
        </button>
      </div>

    </div>
  )
}
