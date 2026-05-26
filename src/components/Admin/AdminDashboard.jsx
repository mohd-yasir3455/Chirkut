// src/components/Admin/AdminDashboard.jsx
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import { useCollection, useDocument, useSetDocument, useUpdateDocument, useDeleteDocument, useUpdateCount, useTotalCount } from '../../hooks/useFirestore';
import AddEntryForm from './AddEntryForm';
import TimelineView from '../TimelineView';
import CounterAnimation from '../CounterAnimation';
import ConfettiEffect from '../ConfettiEffect';
import ManualCountAdjuster from './ManualCountAdjuster';
import { useAuth } from '../../hooks/useAuth';
import { sendEmailEvent } from '../../utils/emailEvents';

const AdminDashboard = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTrackerForm, setShowTrackerForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showCountAdjuster, setShowCountAdjuster] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { documents: entries, loading: entriesLoading } = useCollection('thankyou_entries', 'date');
  const { count: totalCount } = useTotalCount();
  const { updateDocument } = useUpdateDocument('thankyou_entries');
  const { deleteDocument } = useDeleteDocument('thankyou_entries');
  const { updateCount } = useUpdateCount();
  const { user, logout, isAdmin } = useAuth();
  const { document: trackerDoc } = useDocument('menstrual_trackers', 'shared');
  const { setDocument: setTrackerDocument } = useSetDocument('menstrual_trackers', 'shared');

  const firstName = user?.email?.split('@')[0] || 'Admin';
  const topNavItems = useMemo(
    () => [
      { label: 'Home', icon: '⌂', to: '/', active: false, visible: true },
      { label: 'My Moments', icon: '♡', to: '/moments', active: false, visible: true },
      { label: 'Health', icon: '🌷', to: '/tracker', active: false, visible: true },
      { label: 'Admin', icon: '♛', to: '/admin', active: true, visible: isAdmin() },
      { label: 'Paid', icon: '♥', to: '/paid', active: false, visible: isAdmin() },
    ].filter((item) => item.visible),
    [isAdmin]
  );

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

  const handleTrackerSubmit = async (trackerPayload) => {
    const existingHistory = Array.isArray(trackerDoc?.history) ? trackerDoc.history : [];
    const nextReminderDate = new Date(trackerPayload.lastPeriodDate);
    nextReminderDate.setDate(nextReminderDate.getDate() + 28);

    const historyEntry = {
      id: crypto.randomUUID(),
      lastPeriodDate: trackerPayload.lastPeriodDate,
      nextReminderDate,
      periodLength: trackerPayload.periodLength,
      mood: trackerPayload.mood,
      symptoms: trackerPayload.symptoms,
      note: trackerPayload.note,
      createdAt: new Date(),
    };

    await setTrackerDocument({
      userId: user.uid,
      userEmail: user.email,
      lastPeriodDate: trackerPayload.lastPeriodDate,
      nextReminderDate,
      periodLength: trackerPayload.periodLength,
      mood: trackerPayload.mood,
      symptoms: trackerPayload.symptoms,
      note: trackerPayload.note,
      reminderEnabled: trackerPayload.reminderEnabled,
      reminderEmail: trackerPayload.reminderEmail,
      reminderSentForCycle: false,
      history: [historyEntry, ...existingHistory],
    });

    if (trackerPayload.reminderEnabled) {
      await sendEmailEvent('health', { to: trackerPayload.reminderEmail });
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Confetti Effect */}
      <ConfettiEffect trigger={showConfetti} />

      <header className="admin-topbar">
        <div className="admin-brand-mark">
          <div className="admin-brand-icon">💙</div>
          <div>
            <div className="admin-brand-name">Chirkut स्थल</div>
            <div className="admin-brand-subtitle">Control room</div>
          </div>
        </div>

        <div className="admin-topbar-tabs">
          {topNavItems.map((item) => (
            <Link key={item.label} to={item.to} className={`admin-top-tab ${item.active ? 'active' : ''}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="admin-topbar-user">
          <div className="admin-avatar-badge">{firstName.slice(0, 1).toUpperCase()}</div>
          <div className="admin-user-meta">
            <span className="admin-user-name">{firstName}</span>
            <span className="admin-user-email">{user?.email}</span>
          </div>
          <button type="button" className="admin-logout-chip" onClick={logout}>👋 Logout</button>
        </div>
      </header>

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

          <motion.button
            className="btn btn-secondary"
            onClick={() => setShowTrackerForm(!showTrackerForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showTrackerForm ? '✕ Close' : '🌷 Add Health Entry'}
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

      {showTrackerForm && (
        <motion.div
          className="form-section"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <TrackerEntryForm
            defaultEmail={trackerDoc?.reminderEmail || import.meta.env.VITE_FRIEND_EMAIL || user?.email}
            onSubmit={async (payload) => {
              try {
                await handleTrackerSubmit(payload);
                setShowTrackerForm(false);
                setShowConfetti(true);
              } catch (error) {
                console.error('Error saving tracker entry:', error);
              }
            }}
            onCancel={() => setShowTrackerForm(false)}
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

        .admin-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          margin-bottom: 22px;
          padding: 12px 16px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(121, 174, 252, 0.14);
          box-shadow: 0 16px 40px rgba(74, 112, 175, 0.08);
        }

        .admin-brand-mark {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .admin-brand-icon {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, rgba(255, 209, 96, 0.28), rgba(121, 174, 252, 0.18));
          color: #f3bc3f;
          font-size: 18px;
          flex-shrink: 0;
        }

        .admin-brand-name {
          font-size: 24px;
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #163b78;
        }

        .admin-brand-subtitle {
          font-size: 12px;
          color: var(--text-light);
          margin-top: 2px;
        }

        .admin-topbar-tabs {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .admin-top-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(121, 174, 252, 0.12);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 6px 16px rgba(86, 123, 192, 0.05);
        }

        .admin-top-tab.active {
          color: var(--primary-blush);
          background: rgba(121, 174, 252, 0.12);
        }

        .admin-topbar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.76);
          border: 1px solid rgba(121, 174, 252, 0.1);
          min-width: 0;
        }

        .admin-avatar-badge {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-weight: 800;
          color: white;
          background: var(--gradient-soft);
          flex-shrink: 0;
        }

        .admin-user-meta {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .admin-user-name {
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .admin-user-email {
          color: var(--text-light);
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }

        .admin-logout-chip {
          margin-left: 6px;
          border: 1px solid rgba(121, 174, 252, 0.2);
          background: rgba(255, 255, 255, 0.82);
          color: var(--primary-blush);
          border-radius: 999px;
          padding: 9px 14px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
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
          .admin-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .admin-topbar-tabs {
            justify-content: flex-start;
          }

          .admin-topbar-user {
            align-self: flex-start;
          }

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

          .admin-topbar {
            padding: 14px;
            border-radius: 24px;
          }

          .admin-brand-name {
            font-size: 22px;
          }

          .admin-topbar-tabs {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-topbar-user {
            width: 100%;
            justify-content: center;
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

const TrackerEntryForm = ({ defaultEmail, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    lastPeriodDate: new Date().toISOString().split('T')[0],
    periodLength: 5,
    mood: 'okay',
    symptoms: '',
    note: '',
    reminderEnabled: true,
    reminderEmail: defaultEmail || '',
  });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <motion.form
      className="tracker-admin-form card"
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus(null);
        setSaving(true);

        try {
          await onSubmit({
            lastPeriodDate: new Date(formData.lastPeriodDate),
            periodLength: parseInt(formData.periodLength, 10) || 5,
            mood: formData.mood,
            symptoms: formData.symptoms.trim(),
            note: formData.note.trim(),
            reminderEnabled: formData.reminderEnabled,
            reminderEmail: formData.reminderEmail.trim(),
          });
          setStatus({ type: 'success', message: 'Tracker entry saved and health email triggered.' });
        } catch (error) {
          setStatus({ type: 'error', message: error.message || 'Could not save tracker entry.' });
        } finally {
          setSaving(false);
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>🌷 Add Health Entry</h3>
      <p className="tracker-admin-copy">This updates the Health page timeline and sends the immediate `health` care email.</p>

      {status && (
        <div className={`tracker-form-alert ${status.type}`}>
          {status.type === 'success' ? '💌' : '⚠️'} {status.message}
        </div>
      )}

      <div className="tracker-admin-grid">
        <label className="tracker-admin-field">
          <span>Last period start date</span>
          <input type="date" name="lastPeriodDate" value={formData.lastPeriodDate} onChange={handleChange} required />
        </label>

        <label className="tracker-admin-field">
          <span>Typical period length</span>
          <input type="number" min="1" max="10" name="periodLength" value={formData.periodLength} onChange={handleChange} />
        </label>

        <label className="tracker-admin-field">
          <span>Mood</span>
          <select name="mood" value={formData.mood} onChange={handleChange}>
            <option value="okay">Doing okay</option>
            <option value="calm">Calm and steady</option>
            <option value="low">A little low</option>
            <option value="tired">Tired but trying</option>
            <option value="emotional">Extra emotional</option>
          </select>
        </label>

        <label className="tracker-admin-field">
          <span>Reminder email</span>
          <input type="email" name="reminderEmail" value={formData.reminderEmail} onChange={handleChange} required />
        </label>
      </div>

      <label className="tracker-admin-field">
        <span>Symptoms</span>
        <textarea name="symptoms" rows="3" value={formData.symptoms} onChange={handleChange} placeholder="Cramps, low energy, cravings, etc." />
      </label>

      <label className="tracker-admin-field">
        <span>Care note</span>
        <textarea name="note" rows="4" value={formData.note} onChange={handleChange} placeholder="A personal reminder, encouragement, or context for this cycle." />
      </label>

      <label className="tracker-admin-toggle">
        <input type="checkbox" name="reminderEnabled" checked={formData.reminderEnabled} onChange={handleChange} />
        <span>Send the immediate health email and keep reminders active</span>
      </label>

      <div className="tracker-admin-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Health Entry'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>

      <style>{`
        .tracker-admin-form {
          width: 100%;
          max-width: 760px;
          background: rgba(255, 255, 255, 0.84);
        }

        .tracker-admin-copy {
          margin-top: -8px;
          margin-bottom: 18px;
          color: var(--text-secondary);
        }

        .tracker-form-alert {
          margin-bottom: 16px;
          padding: 14px 16px;
          border-radius: 18px;
          font-size: 14px;
          font-weight: 600;
        }

        .tracker-form-alert.success {
          background: rgba(121, 174, 252, 0.12);
          color: #2f63b4;
          border: 1px solid rgba(121, 174, 252, 0.28);
        }

        .tracker-form-alert.error {
          background: rgba(255, 125, 146, 0.12);
          color: #b04d6d;
          border: 1px solid rgba(255, 125, 146, 0.28);
        }

        .tracker-admin-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .tracker-admin-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 14px;
        }

        .tracker-admin-field span {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .tracker-admin-field input,
        .tracker-admin-field select,
        .tracker-admin-field textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(121, 174, 252, 0.16);
          background: rgba(255, 255, 255, 0.92);
          font: inherit;
          color: var(--text-primary);
        }

        .tracker-admin-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 8px 0 18px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .tracker-admin-toggle input {
          width: 18px;
          height: 18px;
          accent-color: #d06b97;
        }

        .tracker-admin-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .tracker-admin-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.form>
  );
};
