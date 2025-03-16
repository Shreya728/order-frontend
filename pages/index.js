import { useState, useEffect } from 'react'
import axios from 'axios'
import { TrashIcon } from '@heroicons/react/24/outline'

const API_URL = "https://order-backend-1.onrender.com"
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000
})

export default function Home() {
  const [currentView, setCurrentView] = useState('create')
  const [orders, setOrders] = useState([])
  const [formData, setFormData] = useState({
    customer_name: '',
    product_name: '',
    price: 0
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch orders when switching to view mode
  useEffect(() => {
    if (currentView === 'view') {
      fetchOrders()
    }
  }, [currentView])

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/orders')
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
      setFormData({ customer_name: '', product_name: '', price: 0 })
      setCurrentView('view') // Switch to view after creation
    } catch (error) {
      handleError(error, 'creating order')
    } finally {
      setLoading(false)
    }
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
    let message = `Error ${context}: `
    if (error.response) {
      message += error.response.data?.detail || error.response.statusText
    } else {
      message += error.message
    }
    setError(message)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">🛍️ Order Manager</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentView('create')}
                className={`px-4 py-2 rounded-lg ${
                  currentView === 'create' 
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Create Order
              </button>
              <button
                onClick={() => setCurrentView('view')}
                className={`px-4 py-2 rounded-lg ${
                  currentView === 'view'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {currentView === 'create' ? (
          /* Create Order Form */
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">✨ Create New Order</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <input
                  type="text"
                  name="customer_name"
                  placeholder="Customer Name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                  required
                />
                <input
                  type="text"
                  name="product_name"
                  placeholder="Product Name"
                  value={formData.product_name}
                  onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                  step="0.01"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating...' : 'Create Order'}
              </button>
            </form>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No orders found. Create one to get started!
              </p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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
                        📅 {new Date(order.order_date).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="ml-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center gap-2"
                    >
                      <TrashIcon className="h-5 w-5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
