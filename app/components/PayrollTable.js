'use client'

import { useState } from 'react'
import { DollarSign, Check, X, Calendar, User, Clock, CreditCard, AlertTriangle } from 'lucide-react'

export default function PayrollTable({ payroll, payPeriod, onPaymentUpdate }) {
  const [loading, setLoading] = useState({})

  const handleMarkPaid = async (ta) => {
    setLoading({ ...loading, [ta.ta_id]: true })

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ta_id: ta.ta_id,
          pay_period: payPeriod,
          total_hours: ta.total_hours,
          total_pay: ta.total_pay
        })
      })

      if (response.ok) {
        onPaymentUpdate()
      } else {
        alert('Failed to mark as paid')
      }
    } catch (error) {
      alert('Error updating payment status')
    } finally {
      setLoading({ ...loading, [ta.ta_id]: false })
    }
  }

  const handleMarkUnpaid = async (ta) => {
    if (!confirm('Are you sure you want to mark this TA as unpaid?')) return

    setLoading({ ...loading, [ta.ta_id]: true })

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/payroll', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ta_id: ta.ta_id,
          pay_period: payPeriod
        })
      })

      if (response.ok) {
        onPaymentUpdate()
      } else {
        alert('Failed to mark as unpaid')
      }
    } catch (error) {
      alert('Error updating payment status')
    } finally {
      setLoading({ ...loading, [ta.ta_id]: false })
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPayPeriod = (period) => {
    const [year, month] = period.split('-')
    return new Date(year, month - 1).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  if (payroll.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hours logged this month</h3>
        <p className="text-gray-500">Payroll data will appear here once TAs log hours for {formatPayPeriod(payPeriod)}</p>
      </div>
    )
  }

  const totalPayroll = payroll.reduce((sum, ta) => sum + ta.total_pay, 0)
  const paidCount = payroll.filter(ta => ta.paid).length

  return (
    <div className="space-y-6">
      {/* Payroll Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <Calendar className="w-5 h-5 inline mr-2" />
              {formatPayPeriod(payPeriod)} Payroll
            </h3>
            <p className="text-gray-600">
              {paidCount} of {payroll.length} TAs paid • ${8.00}/hour
            </p>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPayroll)}
            </div>
            <div className="text-sm text-gray-500">Total Payroll</div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <User className="w-4 h-4 inline mr-1" />
                Teaching Assistant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Clock className="w-4 h-4 inline mr-1" />
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Earnings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Payment Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payroll.map((ta) => (
              <tr key={ta.ta_id} className={`hover:bg-gray-50 ${ta.has_new_hours_after_payment ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{ta.ta_name}</div>
                      <div className="text-sm text-gray-500">{ta.ta_email}</div>
                    </div>
                    {ta.has_new_hours_after_payment && (
                      <AlertTriangle className="w-5 h-5 text-yellow-500 ml-2" title="New hours added after payment" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {ta.total_hours} hours
                  </div>
                  <div className="text-sm text-gray-500">
                    {ta.entries.length} {ta.entries.length === 1 ? 'entry' : 'entries'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {formatCurrency(ta.total_pay)}
                  </div>
                  <div className="text-sm text-gray-500">
                    @ {formatCurrency(ta.hourly_rate)}/hour
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {ta.paid ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-green-800">Paid</div>
                        {ta.paid_date && (
                          <div className="text-sm text-green-600">
                            {new Date(ta.paid_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <X className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-red-800">
                          {ta.has_new_hours_after_payment ? 'Needs Re-payment' : 'Unpaid'}
                        </div>
                        <div className="text-sm text-red-600">
                          {ta.has_new_hours_after_payment ? 'New hours added after payment' : 'Pending payment'}
                        </div>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {ta.paid ? (
                    <button
                      onClick={() => handleMarkUnpaid(ta)}
                      disabled={loading[ta.ta_id]}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {loading[ta.ta_id] ? 'Processing...' : 'Mark Unpaid'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkPaid(ta)}
                      disabled={loading[ta.ta_id]}
                      className={`btn-primary text-sm disabled:opacity-50 ${ta.has_new_hours_after_payment ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                    >
                      {loading[ta.ta_id] ? 'Processing...' : (ta.has_new_hours_after_payment ? 'Re-pay TA' : 'Mark Paid')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <strong>{payroll.length}</strong> TAs • 
          <strong className="text-green-600 ml-1">{paidCount} paid</strong> • 
          <strong className="text-red-600 ml-1">{payroll.length - paidCount} unpaid</strong>
        </div>
        <div className="text-lg font-bold text-gray-900 mt-2 sm:mt-0">
          Total: {formatCurrency(totalPayroll)}
        </div>
      </div>
    </div>
  )
}