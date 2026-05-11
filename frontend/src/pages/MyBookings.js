import React, { useState } from 'react';
import { getBookingsByEmail } from '../utils/api';
import './MyBookings.css';

const STATUS_COLORS = {
  Pending: 'badge-warning',
  Confirmed: 'badge-accent',
  Completed: 'badge-success',
};

const STATUS_ICONS = { Pending: '⏳', Confirmed: '✓', Completed: '◎' };

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !/^\S+@\S+\.\S+$/.test(emailInput)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    setSearched(true);
    setEmail(emailInput);
    try {
      const res = await getBookingsByEmail(emailInput.trim());
      setBookings(res.data.data);
    } catch {
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="my-bookings fade-in">
      <div className="mb-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">Enter your email to view your session history</p>
      </div>

      <form onSubmit={handleSearch} className="email-search-form">
        <div className="email-input-wrap">
          <span className="email-icon">@</span>
          <input
            type="email"
            className="form-input email-input"
            placeholder="your@email.com"
            value={emailInput}
            onChange={e => { setEmailInput(e.target.value); setError(''); }}
          />
        </div>
        <button type="submit" className="btn btn-primary">Find Bookings</button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-container"><div className="spinner" /><span>Fetching your bookings...</span></div>
      ) : searched && bookings.length === 0 && !error ? (
        <div className="empty-state">
          <span className="empty-icon">◎</span>
          <h3>No bookings found</h3>
          <p>No sessions found for <strong>{email}</strong></p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="bookings-container">
          <div className="bookings-summary">
            <span>{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found for <strong>{email}</strong></span>
          </div>
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-item card">
                <div className="booking-main">
                  <div className="booking-expert">
                    <div className="booking-expert-name">{booking.expertName}</div>
                    <span className={`badge ${STATUS_COLORS[booking.status]}`}>
                      {STATUS_ICONS[booking.status]} {booking.status}
                    </span>
                  </div>
                  <div className="booking-when">
                    <span className="booking-date">{formatDate(booking.date)}</span>
                    <span className="booking-time">{booking.timeSlot}</span>
                  </div>
                </div>
                <div className="booking-details">
                  <div className="booking-detail">
                    <span className="detail-label">Category</span>
                    <span>{booking.expertId?.category || '—'}</span>
                  </div>
                  <div className="booking-detail">
                    <span className="detail-label">Booked On</span>
                    <span>{new Date(booking.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  {booking.notes && (
                    <div className="booking-detail booking-notes">
                      <span className="detail-label">Notes</span>
                      <span>{booking.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
