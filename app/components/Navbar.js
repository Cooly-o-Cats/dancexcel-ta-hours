'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, BarChart3, LogIn, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const isActive = (path) => pathname === path

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-dx-gold">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/dancexcel-logo.webp"
              alt="TA Tracker Logo"
              width={140}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold text-dx-black">TA Tracker</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'text-dx-black bg-dx-gold' : 'text-dx-gold hover:bg-dx-gold hover:text-dx-black'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              href="/add-hours"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/add-hours') ? 'text-dx-black bg-dx-gold' : 'text-dx-gold hover:bg-dx-gold hover:text-dx-black'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Log Hours</span>
            </Link>

            <Link
              href="/dashboard"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-dx-black bg-dx-gold' : 'text-dx-gold hover:bg-dx-gold hover:text-dx-black'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/login"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/login') ? 'text-dx-black bg-dx-gold' : 'text-dx-gold hover:bg-dx-gold hover:text-dx-black'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-dx-gold hover:bg-dx-gold hover:text-dx-black transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-dx-gold">
          <nav className="flex flex-col space-y-1 p-4">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/') ? 'text-dx-black bg-dx-gold' : 'text-dx-gold hover:bg-dx-gold hover:text-dx-black'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            <Link
              href="/add-hours"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/add-hours') ? 'text-dx-black bg-dx-gold' : 'text-dx-gold hover:bg-dx-gold hover:text-dx-black'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Plus className="w-5 h-5" />
              <span>Log Hours</span>
            </Link>

            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/dashboard') ? 'text-dx-black bg-dx-gold' : 'text-dx-gold hover:bg-dx-gold hover:text-dx-black'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/login"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/login') ? 'text-dx-black bg-dx-gold' : 'text-dx-gold hover:bg-dx-gold hover:text-dx-black'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <LogIn className="w-5 h-5" />
              <span>Admin</span>
            </Link>
          </nav>
        </div>
      )}
    </nav>
  )
}
