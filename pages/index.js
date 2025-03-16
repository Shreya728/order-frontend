import { useState, useEffect } from 'react'
import axios from 'axios'
import { TrashIcon } from '@heroicons/react/24/outline'

const API_URL = "https://order-backend-1.onrender.com"
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000
})

export default function Home() {
  const [view, setView] = useState('create')
  const [orders, setOrders] = useState([])
  const [formData, setFormData] = useState({
    customer_name: '',
    product_name: '',
    price: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    try {
      const { data } = await axiosInstance.get('/orders')
      setOrders(data)
    } catch (err) {
      handleError(err, 'fetching orders')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await axiosInstance.post('/orders', formData)
      setFormData({ customer_name: '', product_name: '', price: '' })
      // Removed automatic view switch
    } catch (err) {
      handleError(err, 'creating order')
    } finally {
      setLoading(false)
    }
  }

  const deleteOrder = async (id) => {
    try {
      await axiosInstance.delete(`/orders/${id}`)
      fetchOrders()
    } catch (err) {
      handleError(err, 'deleting order')
    }
  }

  const handleError = (error, context) => {
    let message = `Error ${context}: `
    message += error.response?.data?.detail || error.message
    setError(message)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">Order Manager</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setView('create')}
                className={`px-4 py-2 rounded-lg ${
                  view === 'create' ? 'bg-indigo-600 text-white' : 'text-gray-600'
                }`}
              >
                Create Order
              </button>
              <button
                onClick={() => {
                  setView('view')
                  fetchOrders()
                }}
                className={`px-4 py-2 rounded-lg ${
                  view === 'view' ? 'bg-indigo-600 text-white' : 'text-gray-600'
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

        {view === 'create' ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">New Order</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Product Name"
                value={formData.product_name}
                onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-indigo-500"
                step="0.01"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-indigo-600 text-white p-3 rounded-lg ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Processing...' : 'Create Order'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No orders found</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{order.product_name}</h3>
                      <p className="text-gray-600">Customer: {order.customer_name}</p>
                      <p className="text-green-600">${order.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(order.order_date).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-2"
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
