'use client'

import { useState } from 'react'
import { UserPlus, UserMinus, Mail, User, Trash2, AlertTriangle } from 'lucide-react'

export default function ManageTAsForm({ tas, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddTA = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/tas/manage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('TA added successfully!')
        setFormData({ name: '', email: '' })
        setShowAddForm(false)
        onUpdate() // Refresh the TA list
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to add TA')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTA = async (ta) => {
    if (!confirm(`Are you sure you want to delete ${ta.name}? This action cannot be undone.`)) {
      return
    }

    setDeleteLoading({ ...deleteLoading, [ta.id]: true })
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/tas/manage', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: ta.id })
      })

      const data = await response.json()

      if (response.ok) {
        if (data.deactivated) {
          setSuccess(`${ta.name} has been deactivated (had existing hours)`)
        } else {
          setSuccess(`${ta.name} has been deleted successfully`)
        }
        onUpdate() // Refresh the TA list
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to delete TA')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setDeleteLoading({ ...deleteLoading, [ta.id]: false })
    }
  }

  return (
    <div className="space-y-6">
      {/* Add TA Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Teaching Assistant</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add TA'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddTA} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter TA's full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="ta@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add TA'}
            </button>
          </form>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Existing TAs List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Teaching Assistants</h3>
          <span className="text-sm text-gray-500">{tas.length} TAs</span>
        </div>

        {tas.length > 0 ? (
          <div className="space-y-3">
            {tas.map((ta) => (
              <div 
                key={ta.id} 
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  ta.active ? 'bg-white' : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center">
                  <div>
                    <div className="font-medium text-gray-900">
                      {ta.name}
                      {!ta.active && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{ta.email}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTA(ta)}
                  disabled={deleteLoading[ta.id]}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50 p-2 rounded-md hover:bg-red-50"
                  title={ta.active ? "Delete TA" : "Remove inactive TA"}
                >
                  {deleteLoading[ta.id] ? (
                    <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <UserMinus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No teaching assistants found</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Delete Policy:</p>
            <p>• TAs with no hours logged will be permanently deleted</p>
            <p>• TAs with existing hours will be deactivated (hidden from new entries)</p>
          </div>
        </div>
      </div>
    </div>
  )
}