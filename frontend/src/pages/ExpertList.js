import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getExperts } from '../utils/api';
import './ExpertList.css';

const CATEGORIES = ['All', 'Technology', 'Finance', 'Health', 'Legal', 'Marketing', 'Design', 'Business', 'Education'];

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
};

export default function ExpertList() {
  const [experts, setExperts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getExperts({ page, limit: 6, category, search });
      setExperts(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError('Failed to load experts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, category, search]);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div className="expert-list fade-in">
      <div className="list-header">
        <div>
          <h1 className="page-title">Find Your Expert</h1>
          <p className="page-subtitle">Book 1-on-1 sessions with verified professionals</p>
        </div>
        <div className="header-stat">
          <span className="stat-num">{pagination.total}</span>
          <span className="stat-label">Experts Available</span>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
        {search && (
          <button type="button" className="btn btn-ghost" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
            Clear
          </button>
        )}
      </form>

      {/* Category Filter */}
      <div className="category-filter">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-btn ${category === cat ? 'active' : ''}`}
            onClick={() => handleCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <div className="error-banner">{error}</div>}

      {/* Loading */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span>Loading experts...</span>
        </div>
      ) : experts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">◎</span>
          <h3>No experts found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="experts-grid">
            {experts.map((expert) => (
              <Link to={`/experts/${expert._id}`} key={expert._id} className="card expert-card">
                <div className="expert-card-header">
                  <img src={expert.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`} alt={expert.name} className="expert-avatar" />
                  <div className="expert-info">
                    <h3 className="expert-name">{expert.name}</h3>
                    <span className="badge badge-accent">{expert.category}</span>
                  </div>
                </div>
                <div className="expert-card-body">
                  <p className="expert-bio">{expert.bio?.slice(0, 90)}...</p>
                  <div className="expert-meta">
                    <div className="meta-item">
                      <span className="meta-label">Experience</span>
                      <span className="meta-val">{expert.experience} yrs</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Rating</span>
                      <span className="meta-val">
                        <StarRating rating={expert.rating} /> {expert.rating}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Rate</span>
                      <span className="meta-val meta-rate">₹{expert.hourlyRate}/hr</span>
                    </div>
                  </div>
                </div>
                <div className="expert-card-footer">
                  <span className="view-profile">View Profile →</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button className="btn btn-ghost" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
              <div className="page-numbers">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${p === page ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button className="btn btn-ghost" onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
