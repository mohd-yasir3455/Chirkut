// src/components/Admin/AdminDashboard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import { useCollection, useUpdateDocument, useDeleteDocument, useUpdateCount, useTotalCount } from '../../hooks/useFirestore';
import AddEntryForm from './AddEntryForm';
import TimelineView from '../TimelineView';
import CounterAnimation from '../CounterAnimation';
import ConfettiEffect from '../ConfettiEffect';
import ManualCountAdjuster from './ManualCountAdjuster';

const AdminDashboard = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showCountAdjuster, setShowCountAdjuster] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { documents: entries, loading: entriesLoading } = useCollection('thankyou_entries', 'date');
  const { count: totalCount } = useTotalCount();
  const { updateDocument } = useUpdateDocument('thankyou_entries');
  const { deleteDocument } = useDeleteDocument('thankyou_entries');
  const { updateCount } = useUpdateCount();

  const handleEditEntry = async (updatedData) => {
    try {
      await updateDocument(editingEntry.id, updatedData);
      
      // Update count if necessary
      const countDifference = (updatedData.countAdded || 0) - (editingEntry.countAdded || 0);
      if (countDifference !== 0) {
        await updateCount(totalCount + countDifference);
      }
      
      setEditingEntry(null);
      setShowConfetti(true);
    } catch (err) {
      console.error('Error updating entry:', err);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const entryToDelete = entries.find(e => e.id === entryId);
      if (entryToDelete) {
        await deleteDocument(entryId);
        // Deduct count
        await updateCount(Math.max(0, totalCount - (entryToDelete.countAdded || 0)));
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  const handleCountUpdate = async (newCount) => {
    try {
      await updateCount(newCount);
      setShowCountAdjuster(false);
      setShowConfetti(true);
    } catch (err) {
      console.error('Error updating count:', err);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Confetti Effect */}
      <ConfettiEffect trigger={showConfetti} />

      {/* Header */}
      <motion.div
        className="admin-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <h1>👑 Admin Dashboard</h1>
          <p>Manage and celebrate thank you moments</p>
        </div>

        <div className="header-actions">
          <motion.button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showAddForm ? '✕ Close' : '✨ Add Entry'}
          </motion.button>

          <motion.button
            className="btn btn-secondary"
            onClick={() => setShowCountAdjuster(!showCountAdjuster)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showCountAdjuster ? '✕ Close' : '🔢 Adjust Count'}
          </motion.button>
        </div>
      </motion.div>

      {/* Counter */}
      <motion.div
        className="counter-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CounterAnimation count={totalCount} isLoading={entriesLoading} />
      </motion.div>

      {/* Count Adjuster */}
      {showCountAdjuster && (
        <ManualCountAdjuster
          currentCount={totalCount}
          onUpdate={handleCountUpdate}
          onCancel={() => setShowCountAdjuster(false)}
        />
      )}

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          className="form-section"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <AddEntryForm
            onSuccess={() => {
              setShowAddForm(false);
              setShowConfetti(true);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </motion.div>
      )}

      {/* Statistics */}
      <motion.div
        className="admin-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="stat-card">
          <div className="stat-number">{entries.length}</div>
          <div className="stat-label">Total Entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {entries.filter(e => e.isSpecial).length}
          </div>
          <div className="stat-label">Special Moments</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {entries.length > 0
              ? Math.round((entries.filter(e => e.isSpecial).length / entries.length) * 100)
              : 0}
            %
          </div>
          <div className="stat-label">Special Percentage</div>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        className="timeline-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2>📖 All Entries</h2>
        <TimelineView
          entries={entries}
          isLoading={entriesLoading}
          showAdmin={true}
          onEdit={setEditingEntry}
          onDelete={handleDeleteEntry}
        />
      </motion.div>

      {/* Edit Modal */}
      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          onSave={handleEditEntry}
          onCancel={() => setEditingEntry(null)}
        />
      )}

      <style>{`
        .admin-dashboard {
          padding: 40px 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .admin-header {
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

        .header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .counter-section {
          text-align: center;
          padding: 60px 20px;
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 32px;
          border: 1px solid rgba(255, 181, 216, 0.2);
        }

        .form-section {
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 32px;
        }

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: var(--gradient-soft);
          color: white;
          padding: 24px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 8px 20px rgba(255, 181, 216, 0.2);
          transition: transform var(--transition-base);
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-number {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
          line-height: 1;
        }

        .stat-label {
          font-size: 13px;
          font-weight: 500;
          opacity: 0.9;
        }

        .timeline-section {
          padding: 40px 0;
        }

        .timeline-section h2 {
          margin-bottom: 30px;
          color: var(--text-primary);
        }

        @media (max-width: 1024px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1;
          }
        }

        @media (max-width: 640px) {
          .admin-dashboard {
            padding: 20px 16px;
          }

          .admin-header {
            padding: 16px;
            gap: 12px;
          }

          .header-content h1 {
            font-size: 24px;
          }

          .header-actions {
            flex-direction: column;
            width: 100%;
          }

          .header-actions button {
            width: 100%;
          }

          .admin-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Edit Modal Component
const EditEntryModal = ({ entry, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: entry.title,
    description: entry.description || '',
    countAdded: entry.countAdded || 1,
    isSpecial: entry.isSpecial || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onCancel}
    >
      <motion.div
        className="modal-content card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>✏️ Edit Entry</h2>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Points</label>
          <input
            type="number"
            name="countAdded"
            value={formData.countAdded}
            onChange={handleChange}
            min="1"
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="isSpecial"
              checked={formData.isSpecial}
              onChange={handleChange}
            />
            <span>Mark as special</span>
          </label>
        </div>

        <div className="modal-actions">
          <motion.button
            className="btn btn-primary"
            onClick={() => onSave(formData)}
            whileHover={{ scale: 1.05 }}
          >
            ✓ Save
          </motion.button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
          >
            ✕ Cancel
          </button>
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal-content {
            width: 100%;
            max-width: 500px;
            background: white;
            padding: 32px;
          }

          .modal-content h2 {
            margin-top: 0;
          }

          .form-group.checkbox label {
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            margin: 0;
          }

          .form-group.checkbox input[type='checkbox'] {
            width: auto;
            margin: 0;
            width: 20px;
            height: 20px;
          }

          .modal-actions {
            display: flex;
            gap: 12px;
            margin-top: 24px;
          }

          .modal-actions button {
            flex: 1;
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
