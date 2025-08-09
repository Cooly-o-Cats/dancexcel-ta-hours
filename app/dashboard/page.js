'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import HoursTable from '../components/HoursTable'
import { BarChart3, Plus, Users, Clock } from 'lucide-react'

export default function DashboardPage() {
  const [hours, setHours] = useState([])
  const [stats, setStats] = useState({ totalHours: 0, totalEntries: 0, activetas: 0 })
  const [taHoursSummary, setTaHoursSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchHours()
  }, [router])

  const fetchHours = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/hours', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/login')
        return
      }

      const data = await response.json()
      if (response.ok) {
        setHours(data.hours)
        calculateStats(data.hours)
      } else {
        setError(data.error || 'Failed to fetch hours')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (hoursData) => {
    const totalHours = hoursData.reduce((sum, entry) => sum + entry.hours, 0)
    const totalEntries = hoursData.length
    const activetas = new Set(hoursData.map(entry => entry.ta_name)).size

    // Calculate hours by TA
    const hoursByTA = hoursData.reduce((acc, entry) => {
      const taName = entry.ta_name
      if (!acc[taName]) {
        acc[taName] = {
          name: taName,
          email: entry.ta_email,
          totalHours: 0,
          entryCount: 0
        }
      }
      acc[taName].totalHours += entry.hours
      acc[taName].entryCount += 1
      return acc
    }, {})

    // Convert to array and sort by hours (descending)
    const taHoursSummary = Object.values(hoursByTA).sort((a, b) => b.totalHours - a.totalHours)

    setStats({ totalHours, totalEntries, activetas: activetas })
    setTaHoursSummary(taHoursSummary)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/hours', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        const updatedHours = hours.filter(hour => hour.id !== id)
        setHours(updatedHours)
        calculateStats(updatedHours)
      } else {
        alert('Failed to delete entry')
      }
    } catch (error) {
      alert('Error deleting entry')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
  <div className="max-w-7xl mx-auto p-4">
    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-dx-gold mb-2">Admin Dashboard</h1>
        <p className="text-dx-gold/70">Manage teaching assistant hours and view reports</p>
      </div>
      <div className="flex gap-3 mt-4 sm:mt-0">
        <Link href="/add-hours" className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Hours
        </Link>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>
    </div>

    {error && (
      <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {error}
      </div>
    )}

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="card flex items-center gap-4">
        <Clock className="w-8 h-8 text-dx-gold" />
        <div>
          <p className="text-sm text-dx-gold/70">Total Hours</p>
          <p className="text-2xl font-bold text-dx-gold">{stats.totalHours}</p>
        </div>
      </div>

      <div className="card flex items-center gap-4">
        <BarChart3 className="w-8 h-8 text-dx-gold" />
        <div>
          <p className="text-sm text-dx-gold/70">Total Entries</p>
          <p className="text-2xl font-bold text-dx-gold">{stats.totalEntries}</p>
        </div>
      </div>

      <div className="card flex items-center gap-4">
        <Users className="w-8 h-8 text-dx-gold" />
        <div>
          <p className="text-sm text-dx-gold/70">Active TAs</p>
          <p className="text-2xl font-bold text-dx-gold">{stats.activetas}</p>
        </div>
      </div>
    </div>

    {/* Hours by TA Summary */}
    <div className="card mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-dx-gold">Hours by Teaching Assistant</h2>
        <span className="text-sm text-dx-gold/70">{taHoursSummary.length} TAs</span>
      </div>

      {taHoursSummary.length > 0 ? (
        <div className="space-y-4">
          {taHoursSummary.map((ta, index) => (
            <div
              key={ta.name}
              className="flex items-center justify-between p-4 bg-dx-gold/20 rounded-lg border border-dx-gold"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-dx-gold/20 text-black rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-black">{ta.name}</div>
                  <div className="text-sm text-black/60">{ta.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-dx-gold-dark">{ta.totalHours} hours</div>
                <div className="text-sm text-black/60">
                  {ta.entryCount} {ta.entryCount === 1 ? 'entry' : 'entries'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-4 text-dx-gold/40" />
          <p className="text-dx-gold/70">No hours logged yet</p>
        </div>
      )}
    </div>

    {/* Hours Table */}
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-dx-gold">Recent Hours Logged</h2>
        <span className="text-sm text-dx-gold/70">{hours.length} entries</span>
      </div>
      <HoursTable hours={hours} onDelete={handleDelete} />
    </div>
  </div>
)
}