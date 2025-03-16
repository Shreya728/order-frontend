import { useState, useEffect } from 'react'
import axios from 'axios'
import { TrashIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const [orders, setOrders] = useState([])
  const [formData, setFormData] = useState({
    customer_name: '',
    product_name: '',
    price: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_URL = "https://order-backend-1.onrender.com"
  const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000 // 30 seconds timeout
  })

  useEffect(() => {
    console.log('Component mounted, fetching orders')
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/orders')
      console.log('Fetched orders:', response.data)
      setOrders(response.data)
    } catch (error) {
      handleError(error, 'fetching orders')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await axiosInstance.post('/order', formData)
      await fetchOrders()
      setFormData({ customer_name: '', product_name: '', price: 0 })
    } catch (error) {
      handleError(error, 'creating order')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.name === 'price' ? parseFloat(e.target.value) : e.target.value
    }))
  }

  const deleteOrder = async (id) => {
    try {
      await axiosInstance.delete(`/order/${id}`)
      fetchOrders()
    } catch (error) {
      handleError(error, 'deleting order')
    }
  }

  const handleError = (error, context) => {
    let errorMessage = `Error ${context}: `
    
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      errorMessage += 'Request timed out. Please try again.'
    } else if (error.response) {
      errorMessage += error.response.data?.detail || error.response.statusText
    } else if (error.request) {
      errorMessage += 'No response from server - check network connection'
    } else {
      errorMessage += error.message
    }
    
    setError(errorMessage)
    console.error(errorMessage, error)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          🛍️ Order Management System
        </h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">✨ Create New Order</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <input
                type="text"
                name="customer_name"
                placeholder="Customer Name"
                value={formData.customer_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-indigo-600 text-gray-900"
                required
              />
              <input
                type="text"
                name="product_name"
                placeholder="Product Name"
                value={formData.product_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-indigo-600 text-gray-900"
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-indigo-600 text-gray-900"
                step="0.01"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating...' : '➕ Create Order'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">{order.product_name}</h3>
                      <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        ${order.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Customer:</span> {order.customer_name}
                    </p>
                    <p className="text-sm text-gray-400">
                      📅 Ordered: {new Date(order.order_date).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="ml-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No orders found. Create one to get started!</p>
          )}
        </div>
      </div>
    </div>
  )
}
