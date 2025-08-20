'use client'

import { useState } from 'react'
import { Calendar, Clock, User, FileText } from 'lucide-react'

export default function AddHoursForm({ tas, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    ta_id: '',
    date: '',
    hours: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  // Basic validation
  if (!formData.ta_id || !formData.date || !formData.hours) {
    setError('Please fill in all required fields')
    setLoading(false)
    return
  }

  if (parseFloat(formData.hours) <= 0) {
    setError('Hours must be greater than 0')
    setLoading(false)
    return
  }

  try {
    const response = await fetch('/api/hours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        hours: parseFloat(formData.hours)
      }),
    })

    const data = await response.json()

    if (response.ok) {
      // Reset form
      setFormData({
        ta_id: '',
        date: '',
        hours: '',
        notes: ''
      })
      
      onSuccess() // Simplified - no parameters
    } else {
      setError(data.error || 'Failed to log hours')
    }
  } catch (error) {
    setError('Failed to log hours. Please try again.')
  } finally {
    setLoading(false)
  }
}

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* TA Selection */}
      <div>
        <label htmlFor="ta_id" className="block text-sm font-semibold text-dx-gold mb-2">
          <User className="w-4 h-4 inline mr-2 text-dx-gold" />
          Teaching Assistant *
        </label>
        <select
          id="ta_id"
          name="ta_id"
          value={formData.ta_id}
          onChange={handleChange}
          required
          className="input-field border-dx-gold text-dx-gold"
        >
          <option value="" className="text-black">Select a TA</option>
          {tas.map((ta) => (
            <option key={ta.id} value={ta.id} className="text-black">
              {ta.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-semibold text-dx-gold mb-2">
          <Calendar className="w-4 h-4 inline mr-2 text-dx-gold" />
          Date *
        </label>
        <input
          id="date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          max={today}
          required
          className="input-field border-dx-gold text-dx-gold"
        />
      </div>

      {/* Hours */}
      <div>
        <label htmlFor="hours" className="block text-sm font-semibold text-dx-gold mb-2">
          <Clock className="w-4 h-4 inline mr-2 text-dx-gold" />
          Hours Worked *
        </label>
        <input
          id="hours"
          type="number"
          name="hours"
          value={formData.hours}
          onChange={handleChange}
          min="0.25"
          step="0.25"
          max="24"
          required
          className="input-field border-dx-gold text-dx-gold"
          placeholder="e.g. 2.5"
        />
        <p className="text-sm text-dx-gold-dark mt-1">
          Enter in decimal format (e.g., 2.5 for 2 hours 30 minutes)
        </p>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-dx-gold mb-2">
          <FileText className="w-4 h-4 inline mr-2 text-dx-gold" />
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="input-field border-dx-gold text-dx-gold resize-none"
          placeholder="Add any additional notes about the work performed..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging Hours...' : 'Log Hours'}
      </button>
    </form>
  )
}
