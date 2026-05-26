import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCollection, useTotalCount } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import TimelineView from '../components/TimelineView';

const heroSticker = {
  src: '/stickers/hero-cat.png',
  alt: 'Hero sticker',
  fallback: '😎🐱',
};

const timelineStickerMap = {
  'Sarcastics One': { src: '/stickers/timeline-1.png', alt: 'Timeline sticker 1', fallback: '😄' },
  'Malik Ki Galti -- Moj Band Di': { src: '/stickers/timeline-2.png', alt: 'Timeline sticker 2', fallback: '🙌' },
  'Library Light Fix': { src: '/stickers/timeline-3.png', alt: 'Timeline sticker 3', fallback: '🔥' },
};

const isVideoAsset = (src = '') => /\.(mp4|webm|ogg)$/i.test(src);

const StickerMedia = ({ sticker, className, fallbackClassName }) => {
  const [failed, setFailed] = useState(false);

  if (!sticker) {
    return null;
  }

  if (failed || !sticker.src) {
    return <div className={fallbackClassName}>{sticker.fallback || '✨'}<span>Add your media here</span></div>;
  }

  if (isVideoAsset(sticker.src)) {
    return (
      <video
        className={className}
        autoPlay
        loop
        muted
        playsInline
        onError={() => setFailed(true)}
      >
        <source src={sticker.src} />
      </video>
    );
  }

  return (
    <img
      src={sticker.src}
      alt={sticker.alt || 'Sticker'}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

const MyMoments = () => {
  const { documents: entries, loading } = useCollection('thankyou_entries', 'date');
  const { count: totalCount, loading: countLoading } = useTotalCount();
  const { user, isAdmin, logout } = useAuth();

  const specialCount = entries.filter((entry) => entry.isSpecial).length;
  const firstName = user?.email?.split('@')[0] || 'You';
  const recentEntry = entries[0];
  const longestMonth = useMemo(() => {
    const counts = new Map();

    entries.forEach((entry) => {
      const date = entry.date?.toDate?.() || new Date(entry.date);
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      counts.set(label, (counts.get(label) || 0) + 1);
    });

    const [label, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || ['None yet', 0];
    return { label, count };
  }, [entries]);

  const recentMonths = useMemo(() => {
    const counts = new Map();

    entries.forEach((entry) => {
      const date = entry.date?.toDate?.() || new Date(entry.date);
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      counts.set(label, (counts.get(label) || 0) + 1);
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [entries]);

  const topNavItems = [
    { label: 'Home', icon: '⌂', to: '/', active: false, visible: true },
    { label: 'My Moments', icon: '♡', to: '/moments', active: true, visible: true },
    { label: 'Health', icon: '🌷', to: '/tracker', active: false, visible: true },
    { label: 'Admin', icon: '♛', to: '/admin', active: false, visible: isAdmin() },
    { label: 'Paid', icon: '♥', to: '/paid', active: false, visible: isAdmin() },
  ].filter((item) => item.visible);

  const statCards = [
    {
      icon: '✦',
      tint: 'blue',
      value: countLoading ? '...' : totalCount,
      label: 'Total gratitude count',
      hint: recentEntry ? 'Growing with every kind act' : 'Start collecting moments',
    },
    {
      icon: '♡',
      tint: 'rose',
      value: entries.length,
      label: 'Saved moments',
      hint: 'Every story stays here',
    },
    {
      icon: '♛',
      tint: 'gold',
      value: specialCount,
      label: 'Special highlights',
      hint: specialCount > 0 ? 'Your standout memories' : 'Mark a moment special',
    },
    {
      icon: '◔',
      tint: 'violet',
      value: longestMonth.count,
      label: 'Strongest month',
      hint: longestMonth.label,
    },
  ];

  return (
    <motion.div
      className="moments-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="moments-shell card">
        <header className="moments-topbar">
          <div className="moments-brand">
            <div className="moments-brand-icon">💙</div>
            <div>
              <div className="moments-brand-name">Chirkut स्थल</div>
              <div className="moments-brand-subtitle">Memory archive</div>
            </div>
          </div>

          <div className="moments-tabs">
            {topNavItems.map((item) => (
              <Link key={item.label} to={item.to} className={`moments-tab ${item.active ? 'active' : ''}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="moments-user">
            <div className="moments-avatar">{firstName.slice(0, 1).toUpperCase()}</div>
            <div className="moments-user-meta">
              <span className="moments-user-name">{firstName}</span>
              <span className="moments-user-email">{user?.email}</span>
            </div>
            <button type="button" className="moments-logout" onClick={logout}>👋 Logout</button>
          </div>
        </header>

        <header className="moments-header">
          <div>
            <div className="moments-kicker">♡ My Moments</div>
            <h1>Every gratitude note in one place</h1>
            <p>All entries live here on one page with descriptions, dates, and sticker media.</p>
          </div>
          <div className="moments-actions">
            <Link to="/" className="moments-link">← Back Home</Link>
          </div>
        </header>

        <section className="moments-hero">
          <div className="moments-hero-aura aura-left" aria-hidden="true" />
          <div className="moments-hero-aura aura-right" aria-hidden="true" />
          <div className="moments-hero-copy">
            <div className="moments-hero-kicker">♡ Full archive</div>
            <h2>Your gratitude archive</h2>
            <p>The home page stays compact. This page keeps every detail, date, description, and sticker together in one polished space.</p>
            <div className="moments-hero-pills">
              <span className="moments-pill">Detailed memories</span>
              <span className="moments-pill">Searchable timeline</span>
              <span className="moments-pill">Sticker-friendly</span>
            </div>
          </div>
          <div className="moments-hero-visual">
            <div className="moments-floating-note">Your best moments, all together ✨</div>
            <StickerMedia
              sticker={heroSticker}
              className="moments-hero-media"
              fallbackClassName="moments-hero-fallback"
            />
          </div>
        </section>

        <section className="moments-stats">
          {statCards.map((card) => (
            <article key={card.label} className="moments-stat">
              <div className={`moments-stat-icon ${card.tint}`}>{card.icon}</div>
              <div className="moments-stat-body">
                <span className="moments-stat-value">{card.value}</span>
                <span className="moments-stat-label">{card.label}</span>
                <span className="moments-stat-hint">{card.hint}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="moments-content-grid">
          <div className="moments-grid-shell card-glass">
            <div className="timeline-head">
              <div>
                <h2>Full Moments Timeline</h2>
                <p>Descriptions stay here so home can remain compact while this page keeps the full story.</p>
              </div>
              <div className="timeline-summary-badge">{entries.length} entries saved</div>
            </div>

            <TimelineView
              entries={entries}
              isLoading={loading}
              showAdmin={false}
              getEntrySticker={(entry) => timelineStickerMap[entry.title] || null}
              showSearch
            />
          </div>

          <aside className="moments-side-rail">
            <div className="moments-side-card card-glass">
              <div className="side-card-kicker">Recent highlight</div>
              <h3>{recentEntry?.title || 'First moment coming soon'}</h3>
              <p>{recentEntry?.description || 'Add a gratitude note and it will show up here with its full story.'}</p>
            </div>

            <div className="moments-side-card card-glass">
              <div className="side-card-kicker">Top memory months</div>
              <div className="month-peaks">
                {recentMonths.length > 0 ? recentMonths.map(([label, count]) => (
                  <div key={label} className="month-peak">
                    <span>{label}</span>
                    <strong>{count}</strong>
                  </div>
                )) : (
                  <p className="month-empty">No months tracked yet.</p>
                )}
              </div>
            </div>

            <div className="moments-side-card card-glass">
              <div className="side-card-kicker">Archive mood</div>
              <div className="archive-mood">🌷 💌 ✨</div>
              <p>Use this page for the full story, and keep Home light and snappy.</p>
            </div>
          </aside>
        </section>
      </div>

      <style>{`
        .moments-page {
          padding: 24px 18px 32px;
          max-width: 1440px;
          margin: 0 auto;
        }

        .moments-shell {
          padding: 22px;
          border-radius: 30px;
          background:
            radial-gradient(circle at top left, rgba(255, 255, 255, 0.94), rgba(243, 248, 255, 0.86) 52%, rgba(232, 242, 255, 0.76)),
            rgba(255, 255, 255, 0.7);
          box-shadow: 0 24px 60px rgba(74, 112, 175, 0.12);
        }

        .moments-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 22px;
          padding: 12px 14px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.76);
          border: 1px solid rgba(121, 174, 252, 0.12);
        }

        .moments-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .moments-brand-icon {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, rgba(255, 209, 96, 0.28), rgba(121, 174, 252, 0.18));
          color: #f3bc3f;
          font-size: 18px;
        }

        .moments-brand-name {
          font-size: 24px;
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #163b78;
        }

        .moments-brand-subtitle {
          font-size: 12px;
          color: var(--text-light);
          margin-top: 2px;
        }

        .moments-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .moments-tab {
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

        .moments-tab.active {
          color: var(--primary-blush);
          background: rgba(121, 174, 252, 0.12);
        }

        .moments-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(121, 174, 252, 0.1);
          min-width: 0;
        }

        .moments-avatar {
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

        .moments-user-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .moments-user-name {
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .moments-user-email {
          color: var(--text-light);
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }

        .moments-logout {
          border: 1px solid rgba(121, 174, 252, 0.2);
          background: rgba(255, 255, 255, 0.82);
          color: var(--primary-blush);
          border-radius: 999px;
          padding: 9px 14px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .moments-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .moments-kicker {
          color: var(--primary-blush);
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
        }

        .moments-header h1 {
          margin-bottom: 8px;
          font-size: clamp(32px, 4vw, 48px);
        }

        .moments-actions {
          flex-shrink: 0;
        }

        .moments-link {
          display: inline-flex;
          align-items: center;
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid rgba(121, 174, 252, 0.14);
          background: rgba(255, 255, 255, 0.8);
          color: var(--text-primary);
          font-weight: 700;
        }

        .moments-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 240px;
          gap: 18px;
          align-items: center;
          padding: 20px 22px;
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(250, 253, 255, 0.92), rgba(225, 237, 255, 0.95) 58%, rgba(209, 225, 255, 0.92));
          border: 1px solid rgba(121, 174, 252, 0.14);
          margin-bottom: 16px;
        }

        .moments-hero-aura {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(10px);
        }

        .aura-left {
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, rgba(121, 174, 252, 0.18), transparent 72%);
          left: -40px;
          top: -60px;
        }

        .aura-right {
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(255, 206, 116, 0.2), transparent 72%);
          right: -20px;
          bottom: -50px;
        }

        .moments-hero-copy,
        .moments-hero-visual {
          position: relative;
          z-index: 1;
        }

        .moments-hero-kicker {
          color: var(--primary-blush);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .moments-hero h2 {
          margin-bottom: 8px;
          font-size: clamp(28px, 3vw, 38px);
        }

        .moments-hero p {
          color: rgba(34, 56, 95, 0.86);
          max-width: 620px;
        }

        .moments-hero-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .moments-pill {
          padding: 9px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.74);
          border: 1px solid rgba(121, 174, 252, 0.12);
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .moments-hero-visual {
          display: grid;
          gap: 10px;
          justify-items: center;
        }

        .moments-floating-note {
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(121, 174, 252, 0.14);
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .moments-hero-media,
        .moments-hero-fallback {
          width: 100%;
          min-height: 140px;
          border-radius: 18px;
          object-fit: cover;
          display: grid;
          place-items: center;
          font-size: 52px;
          color: #335d94;
          background: rgba(255, 255, 255, 0.5);
          box-shadow: 0 18px 34px rgba(74, 112, 175, 0.12);
        }

        .moments-hero-fallback,
        .moment-media-fallback {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          padding: 16px;
        }

        .moments-hero-fallback span,
        .moment-media-fallback span {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .moments-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .moments-stat {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(121, 174, 252, 0.12);
          border-radius: 20px;
          padding: 18px 16px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          box-shadow: 0 10px 24px rgba(74, 112, 175, 0.06);
        }

        .moments-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .moments-stat-icon.blue {
          background: rgba(121, 174, 252, 0.14);
          color: #4a7bd7;
        }

        .moments-stat-icon.rose {
          background: rgba(255, 173, 205, 0.18);
          color: #e7639c;
        }

        .moments-stat-icon.gold {
          background: rgba(255, 215, 130, 0.24);
          color: #d9a126;
        }

        .moments-stat-icon.violet {
          background: rgba(184, 166, 255, 0.2);
          color: #7f67d8;
        }

        .moments-stat-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .moments-stat-value {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .moments-stat-label {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .moments-stat-hint {
          font-size: 12px;
          color: var(--text-light);
        }

        .moments-content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          gap: 16px;
          align-items: start;
        }

        .moments-grid-shell {
          padding: 18px;
          border-radius: 24px;
        }

        .timeline-head {
          margin-bottom: 14px;
        }

        .timeline-head h2 {
          margin-bottom: 4px;
        }

        .timeline-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .timeline-summary-badge {
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(121, 174, 252, 0.12);
          color: var(--primary-blush);
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .moments-side-rail {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .moments-side-card {
          padding: 18px;
          border-radius: 24px;
        }

        .side-card-kicker {
          color: var(--primary-blush);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .moments-side-card h3 {
          margin-bottom: 8px;
          font-size: 20px;
        }

        .moments-side-card p {
          margin: 0;
          color: var(--text-secondary);
        }

        .month-peaks {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .month-peak {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.68);
          border: 1px solid rgba(121, 174, 252, 0.1);
          font-size: 13px;
          color: var(--text-primary);
        }

        .month-peak strong {
          font-size: 16px;
          color: var(--primary-blush);
        }

        .month-empty {
          color: var(--text-light) !important;
        }

        .archive-mood {
          font-size: 32px;
          margin-bottom: 12px;
          letter-spacing: 0.08em;
        }

        @media (max-width: 900px) {
          .moments-topbar,
          .moments-hero {
            grid-template-columns: 1fr;
          }

          .moments-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .moments-user {
            align-self: flex-start;
          }

          .moments-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .moments-content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .moments-page {
            padding: 14px 10px 24px;
          }

          .moments-shell {
            padding: 16px;
          }

          .moments-topbar,
          .moments-header {
            flex-direction: column;
          }

          .moments-brand-name {
            font-size: 22px;
          }

          .moments-tabs {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .moments-user {
            width: 100%;
            justify-content: center;
          }

          .moments-hero {
            padding: 18px 16px;
          }

          .moments-hero-media,
          .moments-hero-fallback {
            min-height: 120px;
          }

          .moments-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default MyMoments;
