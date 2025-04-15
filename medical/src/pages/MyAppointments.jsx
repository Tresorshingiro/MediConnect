import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import axios from 'axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ appointment, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { backendUrl, token } = useContext(AppContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      // 1. Create payment intent
      const { data } = await axios.post(
        `${backendUrl}/api/user/stripe`,
        { appointmentId: appointment._id },
        { headers: { token } }
      );

      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment intent');
      }

      // 2. Confirm the payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (error) {
        throw error;
      }

      if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">
        Pay ${appointment.docData.fees} for appointment with {appointment.docData.name}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || loading}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay $${appointment.docData.fees}`}
          </button>
        </div>
      </form>
    </div>
  );
};

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_');
    return `${dateArray[0]} ${months[Number(dateArray[1]) - 1]} ${dateArray[2]}`;
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, { 
        headers: { token } 
      });
      
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handlePaymentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    getUserAppointments(); // Refresh the list after successful payment
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Appointments</h1>
      
      {appointments.length === 0 ? (
        <p className="text-gray-600">You have no appointments scheduled.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-shrink-0">
                <img 
                  className="w-24 h-24 object-cover rounded-md bg-indigo-50" 
                  src={item.docData.image} 
                  alt={item.docData.name} 
                />
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-800">{item.docData.name}</h3>
                <p className="text-gray-600">{item.docData.speciality}</p>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700">Address:</h4>
                  <p className="text-xs text-gray-600">{item.docData.address.line1}</p>
                  <p className="text-xs text-gray-600">{item.docData.address.line2}</p>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700">Date & Time:</h4>
                  <p className="text-sm text-gray-600">
                    {slotDateFormat(item.slotDate)} | {item.slotTime}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 sm:w-48">
                {!item.cancelled && (
                  <>
                    <button
                      onClick={() => handlePaymentClick(item)}
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      Pay Online
                    </button>
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {item.cancelled && (
                  <span className="px-4 py-2 border border-red-500 text-red-500 rounded text-center">
                    Cancelled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <Elements stripe={stripePromise}>
              <CheckoutForm
                appointment={selectedAppointment}
                onSuccess={handlePaymentSuccess}
                onClose={() => setShowPaymentModal(false)}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;