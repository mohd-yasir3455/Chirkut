// src/components/Public/PublicView.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useCollection, useTotalCount } from '../../hooks/useFirestore';
import CounterAnimation from '../CounterAnimation';
import TimelineView from '../TimelineView';

const PublicView = () => {
  const { documents: entries, loading: entriesLoading } = useCollection('thankyou_entries', 'date');
  const { count: totalCount, loading: countLoading } = useTotalCount();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <motion.div
      className="public-view"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.section className="welcome-section" variants={itemVariants}>
        <div className="welcome-content">
          <motion.h1 variants={itemVariants} className="gradient-text">
            ✨ Thank You Moments
          </motion.h1>
          <motion.p variants={itemVariants} className="welcome-subtitle">
            A celebration of gratitude and appreciation
          </motion.p>
          <motion.p variants={itemVariants} className="welcome-message">
            Every moment counts. Every thank you is cherished.
          </motion.p>
        </div>

        {/* Decoration */}
        <motion.div
          className="decoration"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          ✨
        </motion.div>
      </motion.section>

      {/* Counter Section */}
      <motion.section className="counter-showcase" variants={itemVariants}>
        <CounterAnimation
          count={totalCount}
          isLoading={countLoading || entriesLoading}
        />

        <motion.div
          className="counter-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>💝 Each point represents a moment of gratitude shared together</p>
        </motion.div>
      </motion.section>

      {/* Timeline Section */}
      <motion.section className="timeline-showcase" variants={itemVariants}>
        <h2>📖 Gratitude Journey</h2>
        <p className="section-subtitle">
          A timeline of all the wonderful moments we've celebrated
        </p>

        {entries.length === 0 ? (
          <div className="empty-timeline">
            <div className="empty-icon">🌸</div>
            <p>No thank you moments yet. Soon to come! 💫</p>
          </div>
        ) : (
          <TimelineView
            entries={entries}
            isLoading={entriesLoading}
            showAdmin={false}
          />
        )}
      </motion.section>

      {/* Stats Section */}
      <motion.section className="stats-section" variants={itemVariants}>
        <h2>📊 By The Numbers</h2>
        
        <div className="stats-grid">
          <motion.div
            className="stat-item"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <div className="stat-icon">📝</div>
            <div className="stat-data">
              <div className="stat-number">{entries.length}</div>
              <div className="stat-text">Total Moments</div>
            </div>
          </motion.div>

          <motion.div
            className="stat-item"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <div className="stat-icon">⭐</div>
            <div className="stat-data">
              <div className="stat-number">
                {entries.filter(e => e.isSpecial).length}
              </div>
              <div className="stat-text">Special Moments</div>
            </div>
          </motion.div>

          <motion.div
            className="stat-item"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <div className="stat-icon">📅</div>
            <div className="stat-data">
              <div className="stat-number">
                {entries.length > 0
                  ? new Set(
                      entries.map(e => {
                        const date = e.date?.toDate?.() || new Date(e.date);
                        return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' });
                      })
                    ).size
                  : 0}
              </div>
              <div className="stat-text">Months</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer Message */}
      <motion.section className="footer-section" variants={itemVariants}>
        <div className="footer-content card">
          <h3>💖 A Special Message</h3>
          <p>
            Thank you for being an amazing friend. Every moment we celebrate here is a
            testament to the gratitude we share. Your presence makes all the difference.
          </p>
          <p className="signature">
            With appreciation, <br /> Always 💕
          </p>
        </div>
      </motion.section>

      <style>{`
        .public-view {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        section {
          margin-bottom: 80px;
        }

        .welcome-section {
          text-align: center;
          position: relative;
          padding: 60px 20px;
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 181, 216, 0.2);
          overflow: hidden;
        }

        .welcome-content {
          position: relative;
          z-index: 2;
        }

        .welcome-section h1 {
          font-size: clamp(32px, 6vw, 56px);
          margin-bottom: 16px;
        }

        .welcome-subtitle {
          font-size: 20px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .welcome-message {
          font-size: 16px;
          color: var(--text-secondary);
          font-style: italic;
          margin: 0;
        }

        .decoration {
          position: absolute;
          top: -20px;
          right: -20px;
          font-size: 120px;
          opacity: 0.1;
          z-index: 1;
        }

        .counter-showcase {
          text-align: center;
          padding: 60px 20px;
          background: linear-gradient(135deg, rgba(255, 181, 216, 0.1) 0%, rgba(232, 212, 248, 0.1) 100%);
          border-radius: 32px;
          border: 1px solid rgba(255, 181, 216, 0.15);
        }

        .counter-message {
          margin-top: 40px;
          font-size: 16px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .timeline-showcase {
          padding: 40px 0;
        }

        .timeline-showcase h2 {
          text-align: center;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .section-subtitle {
          text-align: center;
          color: var(--text-secondary);
          margin-bottom: 40px;
          font-size: 16px;
        }

        .empty-timeline {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 24px;
          border: 1px dashed rgba(255, 181, 216, 0.3);
        }

        .empty-icon {
          font-size: 60px;
          margin-bottom: 16px;
        }

        .empty-timeline p {
          color: var(--text-secondary);
          font-size: 16px;
        }

        .stats-section {
          padding: 40px 0;
        }

        .stats-section h2 {
          text-align: center;
          margin-bottom: 40px;
          color: var(--text-primary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
        }

        .stat-item {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 181, 216, 0.2);
          border-radius: 20px;
          padding: 28px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .stat-item:hover {
          border-color: var(--primary-blush);
          box-shadow: 0 8px 24px rgba(255, 181, 216, 0.15);
        }

        .stat-icon {
          font-size: 40px;
          line-height: 1;
        }

        .stat-data {
          flex: 1;
        }

        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: var(--primary-blush);
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-text {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .footer-section {
          margin-bottom: 0;
        }

        .footer-content {
          text-align: center;
          background: linear-gradient(135deg, rgba(255, 181, 216, 0.1) 0%, rgba(232, 212, 248, 0.1) 100%);
          border: 1px solid rgba(255, 181, 216, 0.2);
        }

        .footer-content h3 {
          font-size: 24px;
          margin-bottom: 16px;
          color: var(--text-primary);
        }

        .footer-content p {
          font-size: 16px;
          line-height: 1.8;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .signature {
          font-style: italic;
          font-size: 15px;
          margin: 0 !important;
          color: var(--primary-blush);
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .public-view {
            padding: 20px 16px;
          }

          section {
            margin-bottom: 50px;
          }

          .welcome-section,
          .counter-showcase {
            padding: 40px 20px;
          }

          .decoration {
            top: 0;
            right: 0;
            font-size: 80px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-item {
            padding: 20px;
          }

          .stat-number {
            font-size: 28px;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default PublicView;
