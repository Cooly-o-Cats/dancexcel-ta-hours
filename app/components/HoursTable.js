'use client'

import { useState } from 'react'
import { Edit2, Trash2, Check, X, Calendar, Clock, User, FileText } from 'lucide-react'

export default function HoursTable({ hours, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})

  const handleEdit = (hour) => {
    setEditingId(hour.id)
    setEditData({
      hours: hour.hours,
      notes: hour.notes || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleSaveEdit = async (id) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/hours', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          hours: parseFloat(editData.hours),
          notes: editData.notes
        })
      })

      if (response.ok) {
        // Refresh the page or update local state
        window.location.reload()
      } else {
        alert('Failed to update entry')
      }
    } catch (error) {
      alert('Error updating entry')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (hours.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hours logged yet</h3>
        <p className="text-gray-500">Hours will appear here once TAs start logging their time</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <User className="w-4 h-4 inline mr-1" />
              TA Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <Clock className="w-4 h-4 inline mr-1" />
              Hours
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {hours.map((hour) => (
            <tr key={hour.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{hour.ta_name}</div>
                <div className="text-sm text-gray-500">{hour.ta_email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(hour.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {editingId === hour.id ? (
                  <input
                    type="number"
                    value={editData.hours}
                    onChange={(e) => setEditData({...editData, hours: e.target.value})}
                    min="0.25"
                    step="0.25"
                    className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <span className="font-medium">{hour.hours}</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                {editingId === hour.id ? (
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    rows={2}
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                ) : (
                  <div className="truncate" title={hour.notes}>
                    {hour.notes || '-'}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(hour.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {editingId === hour.id ? (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleSaveEdit(hour.id)}
                      className="text-green-600 hover:text-green-800"
                      title="Save changes"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-800"
                      title="Cancel edit"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(hour)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit entry"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(hour.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}