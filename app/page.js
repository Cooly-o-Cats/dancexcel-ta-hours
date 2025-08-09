'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => setLoaded(true), [])

  // Sparkle positions and random delays
  const sparkles = Array.from({ length: 12 }).map((_, i) => ({
    top: `${10 + Math.random() * 60}%`,
    left: `${5 + Math.random() * 90}%`,
    delay: `${Math.random() * 5000}ms`,
  }))

  return (
    <>
      {/* Background Layer */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
        {/* Soft moving background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-dx-gold via-yellow-300 to-yellow-200 opacity-10 animate-gradient-move" />

        {/* Sparkles */}
        {sparkles.map(({ top, left, delay }, i) => (
          <span
            key={i}
            className="absolute w-2 h-2 bg-dx-gold rounded-full shadow-lg opacity-0 sparkle"
            style={{ top, left, animationDelay: delay }}
          />
        ))}
      </div>

      {/* Content Layer */}
      <main className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 select-none">
        {/* Heading with shimmer */}
        <h1
          className={`relative text-7xl font-extrabold mb-8 bg-gradient-to-r from-dx-gold to-yellow-400 bg-clip-text text-transparent
            transition-opacity duration-1000 ease-in-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
        >
          Welcome to DanceXcel's TA Family

          {/* Shimmer overlays */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer pointer-events-none" />
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer animate-delay-2000 pointer-events-none" />
        </h1>

        {/* Subtitle with backdrop blur */}
        <p className="max-w-xl text-dx-black text-lg mb-12 px-6 py-3 rounded-lg bg-white/40 backdrop-blur-sm inline-block">
          We’re so glad you’re here! Log your hours, track your progress, and be part of our studio’s growth.
        </p>

        {/* Buttons */}
        <div className="flex gap-10 z-10">
          <Link
            href="/add-hours"
            className="btn-primary text-lg px-12 py-4 shadow-lg relative overflow-hidden rounded-lg"
            onClick={(e) => {
              const ripple = document.createElement('span')
              ripple.className =
                'ripple absolute rounded-full bg-yellow-400 opacity-50 animate-ripple'
              ripple.style.left = `${e.nativeEvent.offsetX}px`
              ripple.style.top = `${e.nativeEvent.offsetY}px`
              e.currentTarget.appendChild(ripple)
              setTimeout(() => ripple.remove(), 600)
            }}
          >
            Log Hours
          </Link>
          <Link
            href="/login"
            className="btn-secondary text-lg px-12 py-4 shadow relative overflow-hidden rounded-lg"
            onClick={(e) => {
              const ripple = document.createElement('span')
              ripple.className =
                'ripple absolute rounded-full bg-dx-gold opacity-40 animate-ripple'
              ripple.style.left = `${e.nativeEvent.offsetX}px`
              ripple.style.top = `${e.nativeEvent.offsetY}px`
              e.currentTarget.appendChild(ripple)
              setTimeout(() => ripple.remove(), 600)
            }}
          >
            Admin Login
          </Link>
        </div>
      </main>
    </>
  )
}
