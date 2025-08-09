'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, BarChart3, LogIn } from 'lucide-react'
import Image from 'next/image'


export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path) => pathname === path

  return (
   <nav className="bg-white shadow-sm border-b border-dx-gold">
  <div className="container mx-auto px-4">
    <div className="flex justify-between items-center h-16">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2">
        <Image
  src="/dancexcel-logo.webp"
  alt="TA Tracker Logo"
  width={140}  // adjust width to fit nicely
  height={40}  // adjust height accordingly
  className="object-contain"
/>

        <span className="text-xl font-bold text-dx-black">TA Tracker</span>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-8">
        <Link
          href="/"
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive('/')
              ? 'text-dx-black bg-dx-gold'
              : 'text-dx-gold hover:bg-dx-gold hover:text-dx-black'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          href="/add-hours"
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive('/add-hours')
              ? 'text-dx-black bg-dx-gold'
              : 'text-dx-gold hover:bg-dx-gold hover:text-dx-black'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Log Hours</span>
        </Link>

        <Link
          href="/dashboard"
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive('/dashboard')
              ? 'text-dx-black bg-dx-gold'
              : 'text-dx-gold hover:bg-dx-gold hover:text-dx-black'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/login"
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive('/login')
              ? 'text-dx-black bg-dx-gold'
              : 'text-dx-gold hover:bg-dx-gold hover:text-dx-black'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Admin</span>
        </Link>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <Link href="/add-hours" className="btn-primary text-sm">
          Log Hours
        </Link>
      </div>
    </div>
  </div>
</nav>

  )
}