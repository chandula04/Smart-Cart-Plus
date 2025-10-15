'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('card');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;

  const handleCheckout = () => {
    setShowPayment(true);
  };

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      setPaymentSuccess(true);
      setTimeout(() => {
        clearCart();
        setPaymentSuccess(false);
        setShowPayment(false);
      }, 2000);
    }, 1500);
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">Thank you for your purchase.</p>
        </div>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Payment</h1>
          
          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatPrice(getCartTotal())}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Select Payment Method</h2>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="text-3xl mb-2">💳</div>
                <div className="text-sm font-medium">Card</div>
              </button>
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="text-3xl mb-2">💵</div>
                <div className="text-sm font-medium">Cash</div>
              </button>
              <button
                onClick={() => setPaymentMethod('mobile')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'mobile'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="text-3xl mb-2">📱</div>
                <div className="text-sm font-medium">Mobile Pay</div>
              </button>
            </div>
          </div>

          {/* Payment Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'mobile' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="text"
                  placeholder="+94 77 123 4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Please proceed to the cashier counter to complete your cash payment.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowPayment(false)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Back to Cart
            </button>
            <button
              onClick={handlePayment}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Pay {formatPrice(getCartTotal())}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Start adding products to your cart!</p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.product.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex gap-4">
                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.product.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Section: {item.product.section} | Category: {item.product.category}
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-center justify-between">
                  <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-gray-200 font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-gray-200 font-bold"
                      disabled={item.quantity >= item.product.quantity}
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium mt-4"
                  >
                    🗑️ Remove
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Subtotal</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({getCartCount()} items)</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>Rs. 0.00</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(getCartTotal())}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 font-semibold text-lg mb-3"
            >
              Proceed to Payment
            </button>

            <Link
              href="/products"
              className="block w-full text-center px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Continue Shopping
            </Link>

            <button
              onClick={clearCart}
              className="w-full mt-3 text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
