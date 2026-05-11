import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExpertById } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import './ExpertDetail.css';

const groupSlotsByDate = (slots) => {
  return slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
};

export default function ExpertDetail() {
  const { id } = useParams();
  const socket = useSocket();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExpert = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getExpertById(id);
      setExpert(res.data.data);
    } catch {
      setError('Could not load expert details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpert();
  }, [id]);

  // Real-time slot updates
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join_expert', id);

    socket.on('slot_booked', ({ expertId, date, timeSlot }) => {
      if (expertId !== id) return;
      setExpert((prev) => {
        if (!prev) return prev;
        const updatedSlots = prev.availableSlots.map((slot) =>
          slot.date === date && slot.time === timeSlot ? { ...slot, isBooked: true } : slot
        );
        return { ...prev, availableSlots: updatedSlots };
      });
    });

    return () => socket.off('slot_booked');
  }, [socket, id]);

  if (loading) return <div className="loading-container"><div className="spinner" /><span>Loading expert...</span></div>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!expert) return null;

  const slotsByDate = groupSlotsByDate(expert.availableSlots || []);
  const availableCount = expert.availableSlots?.filter((s) => !s.isBooked).length || 0;

  return (
    <div className="expert-detail fade-in">
      <Link to="/" className="back-link">← Back to Experts</Link>

      <div className="detail-hero">
        <div className="detail-hero-left">
          <img
            src={expert.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`}
            alt={expert.name}
            className="detail-avatar"
          />
          <div className="detail-info">
            <span className="badge badge-accent">{expert.category}</span>
            <h1 className="detail-name">{expert.name}</h1>
            <p className="detail-bio">{expert.bio}</p>
            <div className="detail-stats">
              <div className="stat-pill">
                <span className="stat-icon">◆</span>
                <span>{expert.experience} years exp</span>
              </div>
              <div className="stat-pill">
                <span className="stat-icon stars">★</span>
                <span>{expert.rating} rating</span>
              </div>
              <div className="stat-pill gold">
                <span>₹{expert.hourlyRate}/hr</span>
              </div>
            </div>
          </div>
        </div>
        <Link to={`/book/${expert._id}`} className="btn btn-primary book-cta">
          Book a Session →
        </Link>
      </div>

      <div className="slots-section">
        <div className="slots-header">
          <h2 className="section-title">Available Slots</h2>
          <span className="badge badge-success">{availableCount} slots open</span>
          <span className="realtime-badge">
            <span className="rt-dot" />
            Live Updates
          </span>
        </div>

        {Object.keys(slotsByDate).length === 0 ? (
          <p className="no-slots">No available slots at the moment.</p>
        ) : (
          Object.entries(slotsByDate).map(([date, slots]) => (
            <div key={date} className="date-group">
              <h3 className="date-label">{formatDate(date)}</h3>
              <div className="time-slots">
                {slots.map((slot) => (
                  <div
                    key={`${slot.date}-${slot.time}`}
                    className={`time-slot ${slot.isBooked ? 'booked' : 'available'}`}
                  >
                    {slot.time}
                    {slot.isBooked && <span className="booked-tag">Booked</span>}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
