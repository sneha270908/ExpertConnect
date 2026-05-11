import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getExpertById, createBooking } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import './BookingForm.css';

const validate = (form) => {
  const errors = {};
  if (!form.userName.trim()) errors.userName = 'Name is required';
  else if (form.userName.trim().length < 2) errors.userName = 'Name must be at least 2 characters';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Invalid email format';
  if (!form.phone.trim()) errors.phone = 'Phone is required';
  else if (!/^[6-9]\d{9}$/.test(form.phone)) errors.phone = 'Enter valid 10-digit Indian mobile number';
  if (!form.date) errors.date = 'Please select a date';
  if (!form.timeSlot) errors.timeSlot = 'Please select a time slot';
  return errors;
};

export default function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);

  const [form, setForm] = useState({ userName: '', email: '', phone: '', date: '', timeSlot: '', notes: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchExpert = async () => {
      try {
        const res = await getExpertById(id);
        const data = res.data.data;
        setExpert(data);
        const booked = (data.availableSlots || []).filter(s => s.isBooked).map(s => `${s.date}_${s.time}`);
        setBookedSlots(booked);
      } catch {
        setApiError('Could not load expert data');
      } finally {
        setLoading(false);
      }
    };
    fetchExpert();
  }, [id]);

  // Real-time slot disable
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join_expert', id);
    socket.on('slot_booked', ({ expertId, date, timeSlot }) => {
      if (expertId !== id) return;
      setBookedSlots(prev => [...prev, `${date}_${timeSlot}`]);
      if (form.date === date && form.timeSlot === timeSlot) {
        setForm(f => ({ ...f, timeSlot: '' }));
        setApiError('That slot was just booked! Please choose another.');
      }
    });
    return () => socket.off('slot_booked');
  }, [socket, id, form.date, form.timeSlot]);

  const availableDates = expert
    ? [...new Set((expert.availableSlots || []).filter(s => !s.isBooked).map(s => s.date))].sort()
    : [];

  const availableTimesForDate = form.date && expert
    ? (expert.availableSlots || [])
        .filter(s => s.date === form.date && !bookedSlots.includes(`${s.date}_${s.time}`))
        .map(s => s.time)
        .sort()
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
    if (name === 'date') setForm(f => ({ ...f, date: value, timeSlot: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');
    try {
      await createBooking({ expertId: id, ...form });
      setSuccess(true);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /><span>Loading...</span></div>;

  if (success) return (
    <div className="success-screen fade-in">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h2>Booking Confirmed!</h2>
        <p>Your session with <strong>{expert?.name}</strong> on <strong>{form.date}</strong> at <strong>{form.timeSlot}</strong> has been booked.</p>
        <p className="success-email">Confirmation details sent to <strong>{form.email}</strong></p>
        <div className="success-actions">
          <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
          <Link to="/" className="btn btn-ghost">Browse More Experts</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="booking-page fade-in">
      <Link to={`/experts/${id}`} className="back-link">← Back to Expert</Link>

      <div className="booking-layout">
        {/* Expert summary */}
        <div className="booking-sidebar">
          <div className="sidebar-card">
            <img
              src={expert?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert?.name}`}
              alt={expert?.name}
              className="sidebar-avatar"
            />
            <h3 className="sidebar-name">{expert?.name}</h3>
            <span className="badge badge-accent">{expert?.category}</span>
            <div className="sidebar-rate">₹{expert?.hourlyRate}<span>/hr</span></div>
            <div className="sidebar-info">
              <span>★ {expert?.rating} rating</span>
              <span>◆ {expert?.experience} yrs exp</span>
            </div>
          </div>
          <div className="booking-rules">
            <h4>Booking Guidelines</h4>
            <ul>
              <li>Sessions are 60 minutes long</li>
              <li>Cancellation allowed 24hrs before</li>
              <li>You'll receive a confirmation email</li>
              <li>Join via link sent to your email</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="booking-form-wrap">
          <h1 className="booking-title">Book a Session</h1>
          {apiError && <div className="error-banner">{apiError}</div>}

          <form onSubmit={handleSubmit} className="booking-form" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input name="userName" className={`form-input ${errors.userName ? 'error' : ''}`} placeholder="Rahul Sharma" value={form.userName} onChange={handleChange} />
                {errors.userName && <span className="form-error">{errors.userName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input name="email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="rahul@example.com" value={form.email} onChange={handleChange} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input name="phone" className={`form-input ${errors.phone ? 'error' : ''}`} placeholder="9876543210" maxLength={10} value={form.phone} onChange={handleChange} />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <select name="date" className={`form-input ${errors.date ? 'error' : ''}`} value={form.date} onChange={handleChange}>
                  <option value="">Select a date</option>
                  {availableDates.map(d => (
                    <option key={d} value={d}>{new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</option>
                  ))}
                </select>
                {errors.date && <span className="form-error">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Time Slot *</label>
                <select name="timeSlot" className={`form-input ${errors.timeSlot ? 'error' : ''}`} value={form.timeSlot} onChange={handleChange} disabled={!form.date}>
                  <option value="">{form.date ? 'Select a time' : 'Select date first'}</option>
                  {availableTimesForDate.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.timeSlot && <span className="form-error">{errors.timeSlot}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea name="notes" className="form-input" rows={3} placeholder="What would you like to discuss?" value={form.notes} onChange={handleChange} />
            </div>

            <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
              {submitting ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Confirming...</> : 'Confirm Booking →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
