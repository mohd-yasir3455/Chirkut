import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDocument } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';

const trackerSticker = {
  src: '/stickers/bonus-meme.png',
  alt: 'Supportive meme',
  fallback: '🩵',
};

const comfortLines = [
  'You deserve gentleness, extra water, and zero guilt for needing rest.',
  'Warmth helps. So does being spoken to softly and fed something nice.',
  'Your body is doing a lot. Slowing down is not weakness.',
  'On difficult days, being cared for is productive enough.',
];

const moodLabels = {
  calm: 'Calm and steady',
  low: 'A little low',
  tired: 'Tired but trying',
  emotional: 'Extra emotional',
  okay: 'Doing okay',
};

const isVideoAsset = (src = '') => /\.(mp4|webm|ogg)$/i.test(src);

const StickerMedia = ({ sticker, className, fallbackClassName }) => {
  const [failed, setFailed] = useState(false);

  if (!sticker) {
    return null;
  }

  if (failed || !sticker.src) {
    return <div className={fallbackClassName}>{sticker.fallback || '✨'}<span>Drop a cute meme here</span></div>;
  }

  if (isVideoAsset(sticker.src)) {
    return (
      <video
        className={className}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
      >
        <source src={sticker.src} />
      </video>
    );
  }

  return <img src={sticker.src} alt={sticker.alt || 'Sticker'} className={className} onError={() => setFailed(true)} />;
};

const toDate = (value) => {
  if (!value) {
    return null;
  }

  const date = value?.toDate?.() || new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatFriendlyDate = (value) => {
  const date = toDate(value);
  if (!date) {
    return 'Not set yet';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const diffInDays = (value) => {
  const date = toDate(value);
  if (!date) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

const daysBetweenDates = (firstValue, secondValue) => {
  const first = toDate(firstValue);
  const second = toDate(secondValue);

  if (!first || !second) {
    return null;
  }

  const start = new Date(first);
  const end = new Date(second);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return Math.abs(Math.round((start - end) / (1000 * 60 * 60 * 24)));
};

const MenstrualTracker = () => {
  const { user, logout, isAdmin } = useAuth();
  const { document: tracker, loading } = useDocument('menstrual_trackers', user?.uid);

  const firstName = user?.email?.split('@')[0] || 'You';
  const reminderEmail = tracker?.reminderEmail || import.meta.env.VITE_FRIEND_EMAIL || user?.email;
  const history = useMemo(() => {
    const items = Array.isArray(tracker?.history) && tracker.history.length > 0
      ? tracker.history
      : tracker?.lastPeriodDate
        ? [{
            id: 'current-cycle',
            lastPeriodDate: tracker.lastPeriodDate,
            nextReminderDate: tracker.nextReminderDate,
            periodLength: tracker.periodLength,
            mood: tracker.mood,
            symptoms: tracker.symptoms,
            note: tracker.note,
          }]
        : [];
    return [...items].sort((a, b) => {
      const first = toDate(a?.lastPeriodDate)?.getTime() || 0;
      const second = toDate(b?.lastPeriodDate)?.getTime() || 0;
      return second - first;
    });
  }, [tracker]);
  const latestEntry = history[0];
  const previousEntry = history[1];
  const daysUntilReminder = diffInDays(tracker?.nextReminderDate);
  const daysSinceLastPeriod = latestEntry ? Math.abs(diffInDays(latestEntry.lastPeriodDate) ?? 0) : null;
  const cycleLengthDays = latestEntry && previousEntry
    ? daysBetweenDates(latestEntry.lastPeriodDate, previousEntry.lastPeriodDate)
    : latestEntry?.periodLength || tracker?.periodLength || null;

  const topNavItems = [
    { label: 'Home', icon: '⌂', to: '/', active: false, visible: true },
    { label: 'My Moments', icon: '♡', to: '/moments', active: false, visible: true },
    { label: 'Health', icon: '🩵', to: '/tracker', active: true, visible: true },
    { label: 'Admin', icon: '♛', to: '/admin', active: false, visible: isAdmin() },
    { label: 'Paid', icon: '♥', to: '/paid', active: false, visible: isAdmin() },
  ].filter((item) => item.visible);

  const trackerStats = [
    {
      icon: '🗓️',
      title: 'Since last period',
      value: latestEntry ? `${daysSinceLastPeriod} days` : 'No dates logged yet',
      accent: 'blue',
    },
    {
      icon: '🌙',
      title: 'Cycle length',
      value: cycleLengthDays ? `${cycleLengthDays} day cycle length` : 'Need two entries to calculate',
      accent: 'rose',
    },
    {
      icon: '⏳',
      title: 'Next period in',
      value:
        tracker?.nextReminderDate
          ? daysUntilReminder !== null
            ? daysUntilReminder >= 0
              ? `${daysUntilReminder} days`
              : `${Math.abs(daysUntilReminder)} days late`
            : formatFriendlyDate(tracker.nextReminderDate)
          : 'Waiting for an admin entry',
      accent: 'violet',
    },
  ];

  return (
    <motion.div
      className="tracker-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="tracker-shell card">
        <header className="tracker-topbar">
          <div className="tracker-brand">
            <div className="tracker-brand-icon">💙</div>
            <div>
              <div className="tracker-brand-name">Chirkut स्थल</div>
              <div className="tracker-brand-subtitle">Health page</div>
            </div>
          </div>

          <div className="tracker-tabs">
            {topNavItems.map((item) => (
              <Link key={item.label} to={item.to} className={`tracker-tab ${item.active ? 'active' : ''}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="tracker-user">
            <div className="tracker-avatar">{firstName.slice(0, 1).toUpperCase()}</div>
            <div className="tracker-user-meta">
              <span className="tracker-user-name">{firstName}</span>
              <span className="tracker-user-email">{user?.email}</span>
            </div>
            <button type="button" className="tracker-logout" onClick={logout}>👋 Logout</button>
          </div>
        </header>

        <section className="tracker-hero">
          <div className="tracker-hero-copy">
            <div className="tracker-kicker">🩵🩵Gentle care🩵🩵</div>
            <h1>Health</h1>
            <p className="tracker-subtitle">A softer dashboard for dates, patterns, and check-ins that matter.</p>
            <p className="tracker-message">For your girl bestfriend: may warm drinks, quiet corners, and a little extra kindness arrive exactly on time.</p>
            <div className="tracker-reminder-chip">
              Entries are now managed from <strong>Admin</strong>
            </div>
          </div>

          <div className="tracker-hero-visual">
            <div className="tracker-floating-note">Her timeline, her comfort, her pace 💌</div>
            <StickerMedia
              sticker={trackerSticker}
              className="tracker-sticker-image"
              fallbackClassName="tracker-sticker-fallback"
            />
          </div>
        </section>

        <section className="tracker-stats">
          {trackerStats.map((stat) => (
            <article key={stat.title} className="tracker-stat">
              <div className={`tracker-stat-icon ${stat.accent}`}>{stat.icon}</div>
              <div className="tracker-stat-copy">
                <div className="tracker-stat-title">{stat.title}</div>
                <div className="tracker-stat-value">{stat.value}</div>
              </div>
            </article>
          ))}
        </section>

        <section className="tracker-content-grid">
          <div className="tracker-timeline card-glass">
            <div className="section-head">
              <div>
                <h2>Cycle timeline</h2>
                <p>Every logged period date appears here so you can spot rhythm without digging around.</p>
              </div>
              <span className="section-badge">{loading ? 'Loading…' : `${history.length} entries`}</span>
            </div>

            {history.length === 0 ? (
              <div className="tracker-empty">
                <div className="tracker-empty-icon">🌷</div>
                <p>No tracker entries yet. Add the first one from the Admin page.</p>
              </div>
            ) : (
              <div className="cycle-timeline">
                {history.map((entry, index) => {
                  const nextCycleDate = entry.nextReminderDate || null;
                  const cycleGap = nextCycleDate ? diffInDays(nextCycleDate) : null;
                  const previousCycleEntry = history[index + 1];
                  const cycleLength = previousCycleEntry
                    ? daysBetweenDates(entry.lastPeriodDate, previousCycleEntry.lastPeriodDate)
                    : entry.periodLength || null;
                  const isLatestCycle = index === 0;

                  return (
                    <div key={entry.id || `${entry.lastPeriodDate}-${index}`} className="cycle-entry">
                      <div className="cycle-dot" />
                      <article className="cycle-card">
                        <div className="cycle-card-top">
                          <div>
                            <h3>{formatFriendlyDate(entry.lastPeriodDate)}</h3>
                            <p className="cycle-mood">{moodLabels[entry.mood] || 'Mood not set'}</p>
                          </div>
                          <span className="cycle-length">{cycleLength ? `${cycleLength} day cycle` : `${entry.periodLength || 5} day log`}</span>
                        </div>

                        <div className="cycle-meta-grid">
                          <div className="cycle-meta">
                            <span>Expected next period</span>
                            <strong>{formatFriendlyDate(nextCycleDate)}</strong>
                          </div>
                          <div className="cycle-meta">
                            <span>{isLatestCycle ? 'Days to next period' : 'Cycle length'}</span>
                            <strong>
                              {isLatestCycle
                                ? cycleGap === null
                                  ? 'Not available'
                                  : cycleGap >= 0
                                    ? `${cycleGap} days`
                                    : `Cycle = ${cycleLength || entry.periodLength || 28} days`
                                : `Cycle = ${cycleLength || entry.periodLength || 28} days`}
                            </strong>
                          </div>
                        </div>

                        {entry.symptoms && (
                          <p className="cycle-note"><strong>Symptoms:</strong> {entry.symptoms}</p>
                        )}

                        {entry.note && (
                          <p className="cycle-note"><strong>Care note:</strong> {entry.note}</p>
                        )}
                      </article>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="tracker-side-rail">
            <div className="tracker-side-card card-glass">
              <div className="side-kicker">Soft reminders</div>
              <ul className="comfort-list">
                {comfortLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="tracker-side-card card-glass">
              <div className="side-kicker">Latest snapshot</div>
              <div className="snapshot-line">
                <span>Latest mood:</span>
                <strong>{latestEntry ? moodLabels[latestEntry.mood] || 'Saved' : 'Not set'}</strong>
              </div>
              <div className="snapshot-line">
                <span>Latest symptoms:</span>
                <strong>{latestEntry?.symptoms || 'No notes yet'}</strong>
              </div>
              <div className="snapshot-line">
                <span>Days until next period:</span>
                <strong>{daysUntilReminder === null ? 'Not set' : daysUntilReminder >= 0 ? `${daysUntilReminder} days` : `${Math.abs(daysUntilReminder)} days past due`}</strong>
              </div>
              <div className="snapshot-line">
                <span>Cycle length:</span>
                <strong>{cycleLengthDays ? `${cycleLengthDays} days` : 'Need more history'}</strong>
              </div>
            </div>

            <div className="tracker-side-card card-glass">
              <div className="side-kicker">Cute little morale boost</div>
              <div className="tracker-meme-line">She is not overreacting. She is multitasking hormones, pain, fatigue, and still showing up. Legendary behavior.</div>
              <div className="tracker-meme-emoji">🩷🌷☕</div>
            </div>
          </aside>
        </section>
      </div>

      <style>{`
        .tracker-page {
          padding: 22px 16px 30px;
          max-width: 1500px;
          margin: 0 auto;
        }

        .tracker-shell {
          padding: 20px;
          border-radius: 30px;
          background:
            radial-gradient(circle at top left, rgba(255, 255, 255, 0.95), rgba(245, 248, 255, 0.88) 50%, rgba(240, 231, 255, 0.8)),
            rgba(255, 255, 255, 0.72);
          box-shadow: 0 24px 60px rgba(74, 112, 175, 0.12);
        }

        .tracker-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 22px;
          padding: 12px 14px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(121, 174, 252, 0.12);
        }

        .tracker-brand,
        .tracker-user {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .tracker-brand-icon,
        .tracker-avatar {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .tracker-brand-icon {
          background: linear-gradient(135deg, rgba(255, 209, 96, 0.28), rgba(121, 174, 252, 0.18));
        }

        .tracker-avatar {
          border-radius: 50%;
          font-weight: 800;
          color: white;
          background: var(--gradient-soft);
        }

        .tracker-brand-name {
          font-size: 24px;
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #163b78;
        }

        .tracker-brand-subtitle,
        .tracker-user-email {
          font-size: 12px;
          color: var(--text-light);
        }

        .tracker-tabs {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .tracker-tab,
        .tracker-logout {
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
        }

        .tracker-tab.active {
          color: var(--primary-blush);
          background: rgba(121, 174, 252, 0.12);
        }

        .tracker-user-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .tracker-user-name {
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .tracker-logout {
          white-space: nowrap;
        }

        .tracker-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
          gap: 18px;
          align-items: center;
          padding: 24px 26px;
          border-radius: 26px;
          margin-bottom: 18px;
          background: linear-gradient(135deg, rgba(255, 248, 252, 0.95), rgba(235, 241, 255, 0.94) 52%, rgba(250, 231, 242, 0.92));
          border: 1px solid rgba(121, 174, 252, 0.12);
          overflow: hidden;
          position: relative;
        }

        .tracker-kicker {
          color: #d06b97;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .tracker-hero h1 {
          margin-bottom: 8px;
          font-size: clamp(34px, 4vw, 52px);
        }

        .tracker-subtitle {
          color: rgba(36, 56, 95, 0.88);
          font-size: 18px;
          margin-bottom: 12px;
        }

        .tracker-message {
          color: rgba(55, 64, 101, 0.92);
          font-size: 15px;
          font-style: italic;
          max-width: 620px;
        }

        .tracker-reminder-chip,
        .tracker-floating-note,
        .section-badge,
        .cycle-length {
          display: inline-flex;
          align-items: center;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid rgba(121, 174, 252, 0.14);
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .tracker-reminder-chip {
          margin-top: 14px;
        }

        .tracker-hero-visual {
          display: grid;
          justify-items: end;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .tracker-sticker-image,
        .tracker-sticker-fallback {
          width: 100%;
          max-width: 250px;
          min-height: 180px;
          border-radius: 22px;
          object-fit: cover;
          background: rgba(255, 255, 255, 0.58);
          box-shadow: 0 18px 34px rgba(74, 112, 175, 0.12);
          display: grid;
          place-items: center;
          font-size: 60px;
          color: #335d94;
        }

        .tracker-sticker-fallback {
          text-align: center;
          padding: 16px;
        }

        .tracker-sticker-fallback span {
          display: block;
          font-size: 12px;
          margin-top: 10px;
          color: var(--text-secondary);
        }

        .tracker-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .tracker-stat {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(121, 174, 252, 0.12);
          box-shadow: 0 10px 24px rgba(74, 112, 175, 0.06);
        }

        .tracker-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .tracker-stat-icon.blue { background: rgba(121, 174, 252, 0.14); }
        .tracker-stat-icon.rose { background: rgba(255, 173, 205, 0.18); }
        .tracker-stat-icon.violet { background: rgba(203, 181, 255, 0.22); }

        .tracker-stat-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-light);
          margin-bottom: 6px;
        }

        .tracker-stat-value {
          color: var(--text-primary);
          font-size: 16px;
          font-weight: 700;
          line-height: 1.45;
        }

        .tracker-content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 16px;
          align-items: start;
        }

        .tracker-timeline,
        .tracker-side-card {
          padding: 20px;
          border-radius: 24px;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .tracker-empty {
          text-align: center;
          padding: 48px 16px;
          color: var(--text-secondary);
        }

        .tracker-empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .cycle-timeline {
          position: relative;
          display: grid;
          gap: 16px;
          padding-left: 28px;
        }

        .cycle-timeline::before {
          content: '';
          position: absolute;
          left: 9px;
          top: 10px;
          bottom: 10px;
          width: 2px;
          background: linear-gradient(to bottom, rgba(208, 107, 151, 0.85), rgba(121, 174, 252, 0.3));
        }

        .cycle-entry {
          position: relative;
        }

        .cycle-dot {
          position: absolute;
          left: -28px;
          top: 28px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #d06b97;
          box-shadow: 0 0 0 6px rgba(208, 107, 151, 0.12);
        }

        .cycle-card {
          padding: 18px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(121, 174, 252, 0.12);
          box-shadow: 0 10px 24px rgba(74, 112, 175, 0.06);
        }

        .cycle-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .cycle-card h3 {
          margin-bottom: 4px;
        }

        .cycle-mood {
          color: var(--text-light);
          font-size: 13px;
          margin: 0;
        }

        .cycle-meta-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 14px;
        }

        .cycle-meta {
          padding: 12px 14px;
          border-radius: 16px;
          background: rgba(240, 247, 255, 0.72);
          border: 1px solid rgba(121, 174, 252, 0.12);
        }

        .cycle-meta span {
          display: block;
          font-size: 12px;
          color: var(--text-light);
          margin-bottom: 6px;
        }

        .cycle-meta strong {
          color: var(--text-primary);
          font-size: 14px;
        }

        .cycle-note {
          margin: 10px 0 0;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .tracker-side-rail {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .side-kicker {
          color: #d06b97;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .comfort-list {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 10px;
          color: var(--text-secondary);
        }

        .snapshot-line {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px dashed rgba(121, 174, 252, 0.16);
          font-size: 13px;
          color: var(--text-secondary);
        }

        .snapshot-line strong {
          color: var(--text-primary);
          text-align: right;
        }

        .tracker-meme-line {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .tracker-meme-emoji {
          font-size: 32px;
        }

        @media (max-width: 1100px) {
          .tracker-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .tracker-user {
            align-self: flex-start;
          }

          .tracker-hero,
          .tracker-content-grid,
          .tracker-stats {
            grid-template-columns: 1fr;
          }

          .tracker-hero-visual {
            justify-items: center;
          }
        }

        @media (max-width: 720px) {
          .tracker-page {
            padding: 14px 10px 24px;
          }

          .tracker-shell {
            padding: 14px;
          }

          .tracker-tabs {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .tracker-user {
            width: 100%;
            justify-content: center;
          }

          .tracker-hero {
            padding: 20px 16px;
          }

          .tracker-hero h1 {
            font-size: 30px;
          }

          .tracker-subtitle {
            font-size: 16px;
          }

          .cycle-meta-grid {
            grid-template-columns: 1fr;
          }

          .tracker-sticker-image,
          .tracker-sticker-fallback {
            max-width: 190px;
            min-height: 140px;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default MenstrualTracker;
