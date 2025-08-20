'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AddHoursForm from '../components/AddHoursForm'
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react'

export default function AddHoursPage() {
  const [tas, setTas] = useState([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTAs()
  }, [])

  const fetchTAs = async () => {
    try {
      const response = await fetch('/api/tas')
      const data = await response.json()

      if (response.ok) {
        setTas(data.tas)
      } else {
        setError('Failed to fetch TAs')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
    }, 5000)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-3" />
          Hours logged successfully! Email confirmation has been sent.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="card">
        <div className="text-center mb-8">
          <Clock className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Log Your Hours</h1>
          <p className="text-gray-600 mt-2">Submit your teaching assistant hours</p>
        </div>

        <AddHoursForm tas={tas} onSuccess={handleSuccess} />
      </div>
    </div>
  )
}