// src/pages/PaidThankYous.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import { useCollection, useAddDocument, useDeleteDocument, useTotalCount } from '../hooks/useFirestore';
import TimelineView from '../components/TimelineView';
import { getProgressPercentage } from '../utils/helpers';

const PaidThankYous = ({ isAdmin = false }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    countDeducted: 1,
  });

  const { documents: paidEntries, loading: paidLoading } = useCollection('paid_entries', 'date');
  const { addDocument, loading: addingDoc } = useAddDocument('paid_entries');
  const { deleteDocument } = useDeleteDocument('paid_entries');
  const { count: totalCount } = useTotalCount();

  // Calculate totals
  const totalPaid = paidEntries.reduce((sum, entry) => sum + (entry.countDeducted || 0), 0);
  const remaining = Math.max(0, totalCount - totalPaid);
  const progressPercentage = getProgressPercentage(totalCount, totalPaid);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      await addDocument({
        title: formData.title.trim(),
        date: Timestamp.fromDate(new Date(formData.date)),
        countDeducted: parseInt(formData.countDeducted) || 1,
        adminEmail: process.env.REACT_APP_ADMIN_EMAIL,
      });

      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        countDeducted: 1,
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding paid entry:', err);
    }
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('Delete this paid entry?')) {
      try {
        await deleteDocument(entryId);
      } catch (err) {
        console.error('Error deleting entry:', err);
      }
    }
  };

  return (
    <div className="paid-page">
      {/* Header */}
      <motion.div
        className="paid-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <h1>💝 Thank You Paid</h1>
          <p>Track thank yous that have been repaid</p>
        </div>

        {isAdmin && (
          <motion.button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showAddForm ? '✕ Close' : '➕ Add Paid Entry'}
          </motion.button>
        )}
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="summary-cards"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Total Owed</div>
            <div className="card-value">{totalCount}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <div className="card-label">Paid Back</div>
            <div className="card-value">{totalPaid}</div>
          </div>
        </div>

        <div className="summary-card highlight">
          <div className="card-icon">💗</div>
          <div className="card-content">
            <div className="card-label">Still Owed</div>
            <div className="card-value">{remaining}</div>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        className="progress-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2>Progress</h2>

        <div className="progress-container">
          <div className="progress-bar-wrapper">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, type: 'easeOut' }}
            />
          </div>
          <div className="progress-text">
            {progressPercentage.toFixed(0)}% repaid
          </div>
        </div>

        <div className="progress-message">
          {remaining === 0 ? (
            <p className="message-success">🎉 All thank yous have been repaid!</p>
          ) : (
            <p className="message-pending">
              💭 {remaining} more thank you{remaining !== 1 ? 's' : ''} to go!
            </p>
          )}
        </div>
      </motion.div>

      {/* Add Form */}
      {isAdmin && showAddForm && (
        <motion.div
          className="add-form-wrapper"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <form onSubmit={handleSubmit} className="paid-form card">
            <h3>➕ Add Paid Entry</h3>

            <div className="form-group">
              <label htmlFor="title">What was repaid?</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter the thank you that was repaid..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date Repaid</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="countDeducted">Count to Deduct</label>
                <input
                  type="number"
                  id="countDeducted"
                  name="countDeducted"
                  value={formData.countDeducted}
                  onChange={handleChange}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="form-actions">
              <motion.button
                type="submit"
                className="btn btn-primary"
                disabled={addingDoc}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {addingDoc ? '⏳ Adding...' : '✓ Add Entry'}
              </motion.button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
                disabled={addingDoc}
              >
                ✕ Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Timeline of Paid Entries */}
      <motion.div
        className="timeline-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2>📖 Repayment Timeline</h2>

        {paidLoading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading...</p>
          </div>
        ) : paidEntries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-emoji">🌟</div>
            <p>No paid entries yet. Thank yous can be repaid anytime!</p>
          </div>
        ) : (
          <TimelineView
            entries={paidEntries}
            isLoading={paidLoading}
            showAdmin={isAdmin}
            onEdit={() => {}}
            onDelete={handleDelete}
          />
        )}
      </motion.div>

      <style>{`
        .paid-page {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .paid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255, 181, 216, 0.2);
        }

        .header-content h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
        }

        .header-content p {
          margin: 0;
          color: var(--text-secondary);
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 181, 216, 0.2);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all var(--transition-base);
        }

        .summary-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 181, 216, 0.4);
          box-shadow: 0 8px 24px rgba(255, 181, 216, 0.15);
        }

        .summary-card.highlight {
          background: var(--gradient-soft);
          color: white;
          border: none;
        }

        .summary-card.highlight:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(255, 181, 216, 0.3);
        }

        .card-icon {
          font-size: 36px;
          line-height: 1;
        }

        .card-content {
          flex: 1;
        }

        .summary-card.highlight .card-content {
          color: white;
        }

        .card-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          opacity: 0.8;
          margin-bottom: 4px;
        }

        .card-value {
          font-size: 32px;
          font-weight: 700;
          line-height: 1;
        }

        .progress-section {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255, 181, 216, 0.2);
          padding: 32px;
          margin-bottom: 40px;
        }

        .progress-section h2 {
          margin-top: 0;
          margin-bottom: 24px;
        }

        .progress-container {
          margin-bottom: 24px;
        }

        .progress-bar-wrapper {
          width: 100%;
          height: 16px;
          background: rgba(255, 181, 216, 0.1);
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 12px;
          border: 1px solid rgba(255, 181, 216, 0.2);
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--gradient-soft);
          border-radius: 8px;
          transition: width 1s ease-out;
        }

        .progress-text {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 600;
          text-align: right;
        }

        .progress-message {
          text-align: center;
          padding: 16px;
          background: rgba(255, 181, 216, 0.05);
          border-radius: 12px;
          margin-top: 16px;
        }

        .progress-message p {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
        }

        .message-success {
          color: #4CAF50 !important;
        }

        .message-pending {
          color: var(--text-secondary) !important;
        }

        .add-form-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
          overflow: hidden;
        }

        .paid-form {
          width: 100%;
          max-width: 600px;
          background: rgba(255, 255, 255, 0.8);
        }

        .paid-form h3 {
          margin-top: 0;
          margin-bottom: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .form-actions button {
          flex: 1;
        }

        .timeline-section {
          padding: 40px 0;
        }

        .timeline-section h2 {
          margin-bottom: 30px;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-secondary);
        }

        .empty-emoji {
          font-size: 60px;
          margin-bottom: 20px;
        }

        @media (max-width: 1024px) {
          .paid-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .paid-header button {
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .paid-page {
            padding: 20px 16px;
          }

          .paid-header {
            padding: 16px;
          }

          .header-content h1 {
            font-size: 24px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .summary-card {
            padding: 16px;
          }

          .card-icon {
            font-size: 28px;
          }

          .card-value {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default PaidThankYous;
