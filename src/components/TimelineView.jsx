// src/components/TimelineView.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDate, groupByMonth, searchEntries } from '../utils/helpers';

const TimelineView = ({ entries = [], isLoading = false, showAdmin = false, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = searchEntries(entries, searchQuery);
  const groupedEntries = groupByMonth(filteredEntries);
  const monthLabels = Object.keys(groupedEntries).sort((a, b) => {
    return new Date(b) - new Date(a);
  });

  if (isLoading) {
    return (
      <div className="timeline-loading">
        <div className="spinner" />
        <p>Loading memories...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-emoji">✨</div>
        <p>No thank you moments yet. Let's create some!</p>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {/* Search Bar */}
      {entries.length > 0 && (
        <div className="timeline-search">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <span className="search-count">
              {filteredEntries.length} found
            </span>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="timeline">
        {monthLabels.length === 0 ? (
          <div className="empty-search">
            <p>No entries match your search</p>
          </div>
        ) : (
          monthLabels.map((monthLabel, monthIndex) => (
            <motion.div
              key={monthLabel}
              className="timeline-month"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: monthIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="month-header">
                <div className="month-label">{monthLabel}</div>
                <div className="month-count">
                  {groupedEntries[monthLabel].length} moment
                  {groupedEntries[monthLabel].length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="month-entries">
                {groupedEntries[monthLabel].map((entry, entryIndex) => (
                  <motion.div
                    key={entry.id}
                    className={`timeline-entry ${entry.isSpecial ? 'special' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: entryIndex * 0.05 }}
                    viewport={{ once: true }}
                  >
                    {/* Timeline Dot */}
                    <div className="timeline-dot" />

                    {/* Entry Card */}
                    <div className="entry-card card">
                      <div className="entry-header">
                        <div className="entry-info">
                          <h3 className="entry-title">{entry.title}</h3>
                          <p className="entry-date">📅 {formatDate(entry.date)}</p>
                        </div>
                        {entry.isSpecial && (
                          <span className="badge badge-special">⭐ Special</span>
                        )}
                      </div>

                      {entry.description && (
                        <p className="entry-description">{entry.description}</p>
                      )}

                      <div className="entry-footer">
                        <div className="entry-count">
                          <span className="count-badge">+{entry.countAdded || 1}</span>
                          <span className="count-label">points</span>
                        </div>

                        {showAdmin && (
                          <div className="entry-actions">
                            <button
                              className="btn btn-secondary btn-small"
                              onClick={() => onEdit(entry)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => {
                                if (window.confirm('Delete this entry?')) {
                                  onDelete(entry.id);
                                }
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <style>{`
        .timeline-container {
          width: 100%;
        }

        .timeline-search {
          position: relative;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: 1.5px solid rgba(255, 181, 216, 0.3);
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          transition: all var(--transition-fast);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-blush);
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 181, 216, 0.1);
        }

        .search-count {
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
        }

        .timeline {
          position: relative;
          padding: 20px 0;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, var(--primary-blush), transparent);
        }

        .timeline-month {
          margin-bottom: 60px;
        }

        .month-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 30px;
          padding: 0 20px;
        }

        .month-label {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .month-count {
          background: var(--gradient-soft);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .month-entries {
          position: relative;
        }

        .timeline-entry {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          position: relative;
        }

        .timeline-dot {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 30px;
          width: 16px;
          height: 16px;
          background: var(--primary-blush);
          border: 4px solid #FFF8F0;
          border-radius: 50%;
          z-index: 10;
          transition: all var(--transition-fast);
        }

        .timeline-entry.special .timeline-dot {
          width: 20px;
          height: 20px;
          background: var(--gradient-gold);
          animation: pulse 2s infinite;
        }

        .timeline-entry:nth-child(odd) {
          flex-direction: row-reverse;
          padding-right: calc(50% + 20px);
        }

        .timeline-entry:nth-child(even) {
          flex-direction: row;
          padding-left: calc(50% + 20px);
        }

        .entry-card {
          flex: 1;
          transition: all var(--transition-base);
        }

        .entry-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(255, 181, 216, 0.2);
        }

        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .entry-info {
          flex: 1;
        }

        .entry-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .entry-date {
          font-size: 13px;
          color: var(--text-light);
          margin: 0;
        }

        .entry-description {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .entry-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 181, 216, 0.15);
        }

        .entry-count {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .count-badge {
          background: linear-gradient(135deg, var(--primary-blush), var(--primary-lavender));
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
        }

        .count-label {
          font-size: 12px;
          color: var(--text-light);
          font-weight: 500;
        }

        .entry-actions {
          display: flex;
          gap: 8px;
        }

        .empty-state,
        .empty-search {
          text-align: center;
          padding: 80px 40px;
          color: var(--text-secondary);
        }

        .empty-emoji {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .timeline-loading {
          text-align: center;
          padding: 60px 20px;
        }

        /* Mobile */
        @media (max-width: 1024px) {
          .timeline::before {
            left: 20px;
          }

          .timeline-entry:nth-child(odd),
          .timeline-entry:nth-child(even) {
            flex-direction: row;
            padding-left: 60px;
            padding-right: 0;
          }

          .timeline-dot {
            left: 20px;
          }

          .month-header {
            padding: 0;
          }
        }

        @media (max-width: 640px) {
          .timeline-entry {
            flex-direction: row;
            padding-left: 40px;
            margin-bottom: 20px;
          }

          .timeline::before {
            left: 10px;
          }

          .timeline-dot {
            left: 10px;
            top: 25px;
          }

          .entry-card {
            font-size: 14px;
          }

          .entry-title {
            font-size: 16px;
          }

          .entry-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .entry-actions {
            width: 100%;
          }

          .entry-actions button {
            flex: 1;
            font-size: 12px;
          }

          .month-label {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default TimelineView;
