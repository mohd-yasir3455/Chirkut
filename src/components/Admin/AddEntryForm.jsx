// src/components/Admin/AddEntryForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import { useAddDocument, useUpdateCount, useTotalCount } from '../../hooks/useFirestore';

const AddEntryForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    countAdded: 1,
    isSpecial: false,
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { addDocument, loading: addingDoc } = useAddDocument('thankyou_entries');
  const { updateCount, loading: updatingCount } = useUpdateCount();
  const { count: totalCount } = useTotalCount();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      // Add the entry
      await addDocument({
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: Timestamp.fromDate(new Date(formData.date)),
        countAdded: parseInt(formData.countAdded) || 1,
        isSpecial: formData.isSpecial,
        adminEmail: import.meta.env.VITE_ADMIN_EMAIL,
      });

      // Update total count
      const newTotal = totalCount + (parseInt(formData.countAdded) || 1);
      await updateCount(newTotal);

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        countAdded: 1,
        isSpecial: false,
      });

      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const isLoading = addingDoc || updatingCount;

  return (
    <motion.form
      className="add-entry-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      {/* Form Title */}
      <h2>✨ Add New Thank You Moment</h2>

      {/* Alerts */}
      {error && (
        <motion.div
          className="alert alert-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚠️ {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          className="alert alert-success"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✅ Entry added successfully!
        </motion.div>
      )}

      {/* Form Fields */}
      <div className="form-group">
        <label htmlFor="title">Event Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What are you thankful for?"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Tell me more about this moment..."
          rows="4"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="countAdded">Points to Add</label>
          <input
            type="number"
            id="countAdded"
            name="countAdded"
            value={formData.countAdded}
            onChange={handleChange}
            min="1"
            max="100"
          />
        </div>
      </div>

      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            name="isSpecial"
            checked={formData.isSpecial}
            onChange={handleChange}
          />
          <span>✨ Mark as special moment</span>
        </label>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <motion.button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <>
              <span className="spinner" /> Adding...
            </>
          ) : (
            '✨ Add Entry'
          )}
        </motion.button>

        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
      </div>

      <style>{`
        .add-entry-form {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 181, 216, 0.2);
          border-radius: 24px;
          padding: 32px;
          max-width: 600px;
          box-shadow: 0 8px 32px rgba(255, 181, 216, 0.15);
        }

        h2 {
          margin-top: 0;
          color: var(--text-primary);
          font-size: 24px;
          margin-bottom: 24px;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .alert-error {
          background: rgba(255, 107, 107, 0.1);
          color: #FF6B6B;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .alert-success {
          background: rgba(76, 175, 80, 0.1);
          color: #4CAF50;
          border: 1px solid rgba(76, 175, 80, 0.3);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group.checkbox {
          margin-bottom: 20px;
        }

        .form-group.checkbox label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          margin: 0;
          font-weight: 500;
        }

        .form-group.checkbox input[type='checkbox'] {
          width: auto;
          margin: 0;
          cursor: pointer;
          width: 20px;
          height: 20px;
          accent-color: var(--primary-blush);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 28px;
        }

        .form-actions button {
          flex: 1;
        }

        @media (max-width: 640px) {
          .add-entry-form {
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          h2 {
            font-size: 20px;
          }
        }
      `}</style>
    </motion.form>
  );
};

export default AddEntryForm;
