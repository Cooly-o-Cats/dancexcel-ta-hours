'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import HoursTable from '../components/HoursTable'
import PayrollTable from '../components/PayrollTable'
import { BarChart3, Plus, Users, Clock, DollarSign, Calendar } from 'lucide-react'
import ManageTAsForm from '../components/ManageTAsForm'


export default function DashboardPage() {
  const [hours, setHours] = useState([])
  const [payroll, setPayroll] = useState([])
  const [stats, setStats] = useState({ totalHours: 0, totalEntries: 0, activetas: 0 })
  const [taHoursSummary, setTaHoursSummary] = useState([])
  const [currentView, setCurrentView] = useState('payroll')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tas, setTas] = useState([])
  const router = useRouter()


  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchData()
  }, [router, selectedMonth, currentView])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (currentView === 'payroll') {
        await fetchPayroll()
      } else {
        await fetchHours()
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchPayroll = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/payroll?period=${selectedMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/login')
        return
      }

      const data = await response.json()
      if (response.ok) {
        setPayroll(data.payroll)
        const totalHours = data.payroll.reduce((sum, ta) => sum + ta.total_hours, 0)
        setStats({
          totalHours,
          totalEntries: data.payroll.length,
          activetas: data.payroll.length,
          totalPay: data.total_amount
        })
      } else {
        setError(data.error || 'Failed to fetch payroll')
      }
    } catch (error) {
      setError('Network error occurred')
    }
  }

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
    }
  }

  const calculateStats = (hoursData) => {
    const totalHours = hoursData.reduce((sum, entry) => sum + entry.hours, 0)
    const totalEntries = hoursData.length
    const activetas = new Set(hoursData.map(entry => entry.ta_name)).size

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

    const taHoursSummary = Object.values(hoursByTA).sort((a, b) => b.totalHours - a.totalHours)
    setStats({ totalHours, totalEntries, activetas })
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

  const handlePaymentUpdate = () => {
    fetchPayroll()
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/')
  }

  const fetchTAs = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/tas', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setTas(data.tas)
      }
    } catch (error) {
      console.error('Failed to fetch TAs:', error)
    }
  }


  const formatMonthYear = (dateString) => {
    const [year, month] = dateString.split('-')
    return new Date(year, month - 1).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage teaching assistant hours and payroll</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Link href="/add-hours" className="btn-primary">
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

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('payroll')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'payroll'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <DollarSign className="w-4 h-4 inline mr-2" />
              Payroll
            </button>
            <button
              onClick={() => setCurrentView('hours')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'hours'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              All Hours
            </button>
            <button
              onClick={() => {
                setCurrentView('manage')
                fetchTAs()
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'manage'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Manage TAs
            </button>
          </div>

          {currentView === 'payroll' && (
            <div className="mt-4 sm:mt-0">
              <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Pay Period
              </label>
              <input
                id="month-select"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input-field w-auto"
              />
            </div>
          )}
        </div>
      </div>

      {currentView === 'manage' ? (
  <ManageTAsForm tas={tas} onUpdate={fetchTAs} />
) : currentView === 'payroll' ? (
  <div className="card">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {formatMonthYear(selectedMonth)} Payroll
      </h2>
      <span className="text-sm text-gray-500">
        {payroll.length} TAs • $8.00/hour
      </span>
    </div>
    <PayrollTable
      payroll={payroll}
      payPeriod={selectedMonth}
      onPaymentUpdate={handlePaymentUpdate}
    />
  </div>
) : (
  <>
    <div className="card mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Hours by Teaching Assistant</h2>
        <span className="text-sm text-gray-500">{taHoursSummary.length} TAs</span>
      </div>

      {taHoursSummary.length > 0 ? (
        <div className="space-y-4">
          {taHoursSummary.map((ta, index) => (
            <div key={ta.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{ta.name}</div>
                  <div className="text-sm text-gray-500">{ta.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{ta.totalHours} hours</div>
                <div className="text-sm text-gray-500">{ta.entryCount} {ta.entryCount === 1 ? 'entry' : 'entries'}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No hours logged yet</p>
        </div>
      )}
    </div>

    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">All Hours Logged</h2>
        <span className="text-sm text-gray-500">{hours.length} entries</span>
      </div>
      <HoursTable hours={hours} onDelete={handleDelete} />
    </div>
  </>
)}
    </div>
  )
}