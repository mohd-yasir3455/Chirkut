// src/components/Admin/ManualCountAdjuster.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ManualCountAdjuster = ({ currentCount, onUpdate, onCancel }) => {
  const [newCount, setNewCount] = useState(currentCount);
  const [adjustmentType, setAdjustmentType] = useState('set'); // 'set' or 'adjust'
  const [adjustment, setAdjustment] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSetCount = async () => {
    if (newCount < 0) {
      alert('Count cannot be negative!');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(newCount);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustCount = async () => {
    if (currentCount + adjustment < 0) {
      alert('Count cannot be negative!');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(currentCount + adjustment);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="count-adjuster card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h3>🔢 Manually Adjust Count</h3>

      {/* Type Selector */}
      <div className="adjuster-tabs">
        <button
          className={`tab ${adjustmentType === 'set' ? 'active' : ''}`}
          onClick={() => setAdjustmentType('set')}
        >
          Set Exact Count
        </button>
        <button
          className={`tab ${adjustmentType === 'adjust' ? 'active' : ''}`}
          onClick={() => setAdjustmentType('adjust')}
        >
          Add/Remove
        </button>
      </div>

      {/* Current Count Display */}
      <div className="count-display">
        <div className="display-box">
          <span className="label">Current Count</span>
          <span className="value">{currentCount}</span>
        </div>
      </div>

      {/* Set Mode */}
      {adjustmentType === 'set' && (
        <motion.div
          className="input-group"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <label>New Count Value</label>
          <input
            type="number"
            value={newCount}
            onChange={(e) => setNewCount(parseInt(e.target.value) || 0)}
            min="0"
          />
          <div className="preview">
            Change: {newCount > currentCount ? '+' : ''}{newCount - currentCount}
          </div>
        </motion.div>
      )}

      {/* Adjust Mode */}
      {adjustmentType === 'adjust' && (
        <motion.div
          className="input-group"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <label>Add or Remove Points</label>
          <input
            type="number"
            value={adjustment}
            onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
            placeholder="Enter amount (+ or -)"
          />
          <div className="preview">
            New Total: {currentCount + adjustment}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="adjuster-actions">
        <motion.button
          className="btn btn-primary"
          onClick={adjustmentType === 'set' ? handleSetCount : handleAdjustCount}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? '⏳ Updating...' : '✓ Update Count'}
        </motion.button>

        <button
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          ✕ Cancel
        </button>
      </div>

      <style>{`
        .count-adjuster {
          max-width: 500px;
          margin: 0 auto;
        }

        h3 {
          margin-top: 0;
          color: var(--text-primary);
        }

        .adjuster-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .tab {
          flex: 1;
          padding: 12px;
          border: 2px solid rgba(255, 181, 216, 0.3);
          background: transparent;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .tab:hover {
          border-color: var(--primary-blush);
        }

        .tab.active {
          background: var(--primary-blush);
          color: white;
          border-color: var(--primary-blush);
        }

        .count-display {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .display-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, var(--primary-lavender), var(--primary-mint));
          padding: 20px 40px;
          border-radius: 16px;
          color: white;
        }

        .display-box .label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .display-box .value {
          font-size: 40px;
          font-weight: 700;
          line-height: 1;
        }

        .input-group {
          margin-bottom: 24px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .input-group input {
          width: 100%;
          padding: 12px;
          border: 1.5px solid rgba(255, 181, 216, 0.3);
          border-radius: 12px;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.7);
          margin-bottom: 12px;
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--primary-blush);
          background: white;
        }

        .preview {
          padding: 12px;
          background: rgba(255, 181, 216, 0.1);
          border-left: 3px solid var(--primary-blush);
          border-radius: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .adjuster-actions {
          display: flex;
          gap: 12px;
        }

        .adjuster-actions button {
          flex: 1;
        }
      `}</style>
    </motion.div>
  );
};

export default ManualCountAdjuster;
