import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState('Card');
  
  // Payment form data
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    upiId: '',
    accountNumber: '',
    bankName: '',
    ifscCode: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  useEffect(() => {
    if (booking) setMethod(booking.paymentMethod || 'Card');
  }, [booking]);

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const validatePayment = () => {
    if (method === 'Card') {
      if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) {
        toast.error('Please enter a valid card number');
        return false;
      }
      if (!paymentData.cardName) {
        toast.error('Please enter cardholder name');
        return false;
      }
      if (!paymentData.expiry) {
        toast.error('Please enter expiry date');
        return false;
      }
      if (!paymentData.cvv || paymentData.cvv.length < 3) {
        toast.error('Please enter valid CVV');
        return false;
      }
    } else if (method === 'UPI') {
      if (!paymentData.upiId) {
        toast.error('Please enter UPI ID');
        return false;
      }
    } else if (method === 'Bank Transfer') {
      if (!paymentData.accountNumber || !paymentData.bankName) {
        toast.error('Please enter bank details');
        return false;
      }
    }
    return true;
  };

  const handlePayNow = async () => {
    if (!booking) return;
    if (booking.paymentStatus === 'Paid') return;
    
    if (!validatePayment()) return;
    
    setPaying(true);
    try {
      await api.post(`/bookings/${id}/pay`, { method, paymentData });
      toast.success('Payment successful! Booking confirmed.');
      setTimeout(() => navigate('/bookings'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div style={{ padding: 40 }}><div className="loading-spinner" /></div>;
  if (!booking) return <div style={{ padding: 40 }}>Booking not found.</div>;

  const paymentMethods = [
    { id: 'Card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'UPI', name: 'UPI Payment', icon: '📱' },
    { id: 'Bank Transfer', name: 'Bank Transfer', icon: '🏦' },
    { id: 'Cash', name: 'Cash on Arrival', icon: '💵' }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <button 
          onClick={() => navigate('/bookings')} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--primary)', 
            cursor: 'pointer', 
            fontSize: 14, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6,
            padding: '4px 0'
          }}
        >
          ← Back to Bookings
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 12, color: 'var(--gray-900)' }}>Complete Your Payment</h1>
        <p style={{ color: 'var(--gray-600)', marginTop: 6 }}>Secure payment gateway • 256-bit SSL encrypted</p>
      </div>

      {booking.paymentStatus === 'Paid' && (
        <div style={{ 
          padding: '16px 20px', 
          background: 'var(--success-light)', 
          borderRadius: 'var(--radius)', 
          border: '2px solid var(--success)', 
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ fontSize: 24 }}>✓</span>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--success)' }}>Payment Already Completed</div>
            <div style={{ fontSize: 13, color: 'var(--gray-700)', marginTop: 2 }}>This booking has been successfully paid</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>
        {/* Payment Form */}
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--gray-900)' }}>Payment Method</h2>
          
          {/* Payment Method Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
            {paymentMethods.map(pm => (
              <div
                key={pm.id}
                onClick={() => setMethod(pm.id)}
                style={{
                  padding: '14px 16px',
                  border: `2px solid ${method === pm.id ? 'var(--primary)' : 'var(--gray-200)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: method === pm.id ? 'var(--primary-light)' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <span style={{ fontSize: 24 }}>{pm.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-900)' }}>{pm.name}</div>
                </div>
                {method === pm.id && <span style={{ color: 'var(--primary)', fontSize: 18 }}>✓</span>}
              </div>
            ))}
          </div>

          {/* Payment Details Form */}
          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--gray-900)' }}>Payment Details</h3>
            
            {method === 'Card' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Card Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    value={paymentData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\D/g, ''))}
                    style={{ fontSize: 15, letterSpacing: '0.5px' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cardholder Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="JOHN DOE"
                    value={paymentData.cardName}
                    onChange={(e) => handleInputChange('cardName', e.target.value.toUpperCase())}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={paymentData.expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                        handleInputChange('expiry', val);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV *</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="123"
                      maxLength="3"
                      value={paymentData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
                <div style={{ 
                  padding: '12px 14px', 
                  background: 'var(--info-light)', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: 12,
                  color: 'var(--gray-700)',
                  display: 'flex',
                  gap: 8
                }}>
                  <span>🔒</span>
                  <span>Your card details are encrypted and secure</span>
                </div>
              </div>
            )}

            {method === 'UPI' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">UPI ID *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="yourname@paytm"
                    value={paymentData.upiId}
                    onChange={(e) => handleInputChange('upiId', e.target.value)}
                  />
                </div>
                <div style={{ 
                  padding: '14px 16px', 
                  background: 'var(--gray-50)', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: 13,
                  color: 'var(--gray-700)'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Supported UPI Apps:</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>• Google Pay</span>
                    <span>• PhonePe</span>
                    <span>• Paytm</span>
                    <span>• Amazon Pay</span>
                  </div>
                </div>
              </div>
            )}

            {method === 'Bank Transfer' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Bank Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your bank name"
                    value={paymentData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter account number"
                    value={paymentData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">IFSC Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ABCD0123456"
                    value={paymentData.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                  />
                </div>
              </div>
            )}

            {method === 'Cash' && (
              <div style={{ 
                padding: '16px 18px', 
                background: 'var(--warning-light)', 
                borderRadius: 'var(--radius-sm)', 
                fontSize: 13,
                color: 'var(--gray-700)'
              }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>💵 Cash Payment</div>
                <p>You can pay in cash when you arrive at the tour location. Please bring exact amount if possible.</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Summary */}
        <div>
          <div className="card" style={{ padding: 24, position: 'sticky', top: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--gray-900)' }}>Booking Summary</h3>
            
            {booking.tour?.coverImage && (
              <img 
                src={booking.tour.coverImage} 
                alt={booking.tour?.title}
                style={{ 
                  width: '100%', 
                  height: 140, 
                  objectFit: 'cover', 
                  borderRadius: 'var(--radius-sm)', 
                  marginBottom: 16 
                }}
              />
            )}
            
            <div style={{ display: 'grid', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tour Package</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4, color: 'var(--gray-900)' }}>{booking.tour?.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 2 }}>{booking.tour?.destination}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Booking Reference</span>
                <code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  {booking.bookingRef}
                </code>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Travel Date</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(booking.travelDate)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Guests</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {booking.adults} Adult{booking.adults > 1 ? 's' : ''} 
                  {booking.children > 0 && ` + ${booking.children} Child${booking.children > 1 ? 'ren' : ''}`}
                </span>
              </div>
            </div>
            
            <div style={{ paddingTop: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Subtotal</span>
                <span style={{ fontSize: 13 }}>{formatCurrency(booking.totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Service Fee</span>
                <span style={{ fontSize: 13 }}>$0.00</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingTop: 16, 
                borderTop: '2px solid var(--gray-200)', 
                marginTop: 8 
              }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>Total Amount</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>
            
            <button
              className="btn btn-primary"
              onClick={handlePayNow}
              disabled={paying || booking.paymentStatus === 'Paid'}
              style={{ 
                width: '100%', 
                padding: '14px', 
                fontSize: 15, 
                fontWeight: 600,
                opacity: (paying || booking.paymentStatus === 'Paid') ? 0.6 : 1
              }}
            >
              {paying ? '⏳ Processing Payment...' : booking.paymentStatus === 'Paid' ? '✓ Already Paid' : `💳 Pay ${formatCurrency(booking.totalAmount)}`}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--gray-500)' }}>
              By completing this payment, you agree to our terms and conditions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
