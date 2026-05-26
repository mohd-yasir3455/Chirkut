import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCollection, useTotalCount } from '../../hooks/useFirestore';
import { useAuth } from '../../hooks/useAuth';

const heroSticker = {
  src: '/stickers/hero-cat.png',
  alt: 'Hero sticker',
  fallback: '😎🐱',
};

const sidebarSticker = {
  src: '/stickers/sidebar-meme.png',
  alt: 'Sidebar meme',
  fallback: '😎🐶',
};

const memeBreak = {
  src: '/stickers/meme-break.png',
  alt: 'Meme break',
  fallback: '😂',
};

const bonusMeme = {
  src: '/stickers/bonus-meme.png',
  alt: 'Bonus meme',
  fallback: '🤣',
};

const timelineStickerMap = {
  'Sarcastics One': { src: '/stickers/timeline-1.png', alt: 'Timeline sticker 1', fallback: '😄' },
  'Malik Ki Galti -- Moj Band Di': { src: '/stickers/timeline-2.png', alt: 'Timeline sticker 2', fallback: '🙌' },
  'Library Light Fix': { src: '/stickers/timeline-3.png', alt: 'Timeline sticker 3', fallback: '🔥' },
};

const tips = [
  'Once a bodmosh is always a badmosh. Keep that in mind! 😎',
  'You do alot for others but dont forget to thank yourself too! 🙌',
  'And do things that make you happy, because a happy you is a grateful you! 😊',
  'last but not the least, You are Awsome my Patle domst 😎 maka Laadle Meow',
];

const footerPills = [
  { emoji: '😎', title: 'Why Gratitude Rocks', text: 'Kind words land harder than you think.' },
  { emoji: '🙂', title: 'Boosts Happiness', text: 'More gratitude, more smiles.' },
  { emoji: '🌸', title: 'Stronger Connections', text: 'Build better bonds with kind words.' },
  { emoji: '💚', title: 'Better Health', text: 'Good vibes = good health.' },
  { emoji: '🧠', title: 'More Positivity', text: 'Train your brain to focus on good.' },
];

const isVideoAsset = (src = '') => /\.(mp4|webm|ogg)$/i.test(src);

const StickerMedia = ({ sticker, className, fallbackClassName }) => {
  const [failed, setFailed] = useState(false);

  if (!sticker) {
    return null;
  }

  if (failed || !sticker.src) {
    return <div className={fallbackClassName}>{sticker.fallback || '✨'}<span>Add your meme here</span></div>;
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
        <source src={sticker.src} type={`video/${sticker.src.split('.').pop()?.toLowerCase() === 'mov' ? 'mp4' : sticker.src.split('.').pop()?.toLowerCase() || 'mp4'}`} />
      </video>
    );
  }

  return <img src={sticker.src} alt={sticker.alt || 'Sticker'} className={className} onError={() => setFailed(true)} />;
};

const PublicView = () => {
  const { documents: entries, loading: entriesLoading } = useCollection('thankyou_entries', 'date');
  const { count: totalCount, loading: countLoading } = useTotalCount();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('dashboard');

  const sectionRefs = {
    dashboard: useRef(null),
    moments: useRef(null),
    calendar: useRef(null),
    analytics: useRef(null),
    badges: useRef(null),
    settings: useRef(null),
  };

  const entryCount = entries.length;
  const specialCount = entries.filter((entry) => entry.isSpecial).length;
  const monthCount = entries.length > 0
    ? new Set(
        entries.map((entry) => {
          const date = entry.date?.toDate?.() || new Date(entry.date);
          return `${date.getFullYear()}-${date.getMonth()}`;
        })
      ).size
    : 0;

  const thisMonthCount = entries.filter((entry) => {
    const date = entry.date?.toDate?.() || new Date(entry.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const recentMonths = useMemo(() => {
    const map = new Map();

    entries.forEach((entry) => {
      const date = entry.date?.toDate?.() || new Date(entry.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      map.set(key, (map.get(key) || { label, count: 0 }));
      map.get(key).count += 1;
    });

    return Array.from(map.values()).slice(0, 4);
  }, [entries]);

  const firstName = user?.email?.split('@')[0] || 'You';
  const recentEntry = entries[0];
  const homePreviewEntries = entries.slice(0, 6);

  const topNavItems = [
    { label: 'Home', icon: '⌂', to: '/', active: true, visible: true },
    { label: 'My Moments', icon: '♡', to: '/moments', active: false, visible: true },
    { label: 'Health', icon: '🩵', to: '/tracker', active: false, visible: true },
    { label: 'Admin', icon: '♛', to: '/admin', active: false, visible: isAdmin() },
    { label: 'Paid', icon: '♥', to: '/paid', active: false, visible: isAdmin() },
  ].filter((item) => item.visible);

  const sideNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { key: 'moments', label: 'My Moments', icon: '♡', route: '/moments' },
    { key: 'health', label: 'Health', icon: '🩵', route: '/tracker' },
    { key: 'calendar', label: 'Calendar', icon: '◫' },
    { key: 'analytics', label: 'Analytics', icon: '◔' },
    { key: 'badges', label: 'Badges', icon: '✦' },
    { key: 'settings', label: 'Settings', icon: '⚙' },
  ];

  const statCards = [
    {
      icon: '✦',
      iconClass: 'blue',
      value: countLoading ? '...' : totalCount,
      label: 'Total Moments',
      hint: `+${thisMonthCount} this month`,
    },
    {
      icon: '♥',
      iconClass: 'rose',
      value: entryCount,
      label: 'Number of Thanks Events',
      hint: recentEntry ? '+3 this month' : 'Start your first note',
    },
    {
      icon: '★',
      iconClass: 'gold',
      value: specialCount,
      label: 'Badges Earned',
      hint: specialCount > 0 ? 'Keep it up!' : 'Mark key milestones',
    },
    {
      icon: '◫',
      iconClass: 'violet',
      value: monthCount,
      label: 'Days Active',
      hint: monthCount > 0 ? '+4 this month' : 'New journey ahead',
    },
  ];

  const scrollToSection = (key) => {
    setActiveSection(key);
    sectionRefs[key]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSideNavClick = (item) => {
    if (item.route) {
      navigate(item.route);
      return;
    }

    scrollToSection(item.key);
  };

  const getEntrySticker = (entry) => timelineStickerMap[entry.title] || null;

  return (
    <motion.div
      className="public-dashboard"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="dashboard-shell card">
        <aside className="dashboard-sidebar">
          <div className="brand-mark">
            <div className="brand-icon">💙</div>
            <div>
              <div className="brand-name">Chirkut स्थल</div>
              <div className="brand-subtitle">Badmosi dashboard</div>
            </div>
          </div>

          <nav className="side-nav">
            {sideNavItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`side-nav-item ${activeSection === item.key ? 'active' : ''}`}
                onClick={() => handleSideNavClick(item)}
              >
                <span className="side-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-meme card-glass">
            <StickerMedia
              sticker={sidebarSticker}
              className="sidebar-meme-image"
              fallbackClassName="sidebar-meme-fallback"
            />
          </div>

          <div className="sidebar-promo">
            <p className="promo-title">Keep Spreading Gratitude! 💙</p>
            <p className="promo-caption">You've shared</p>
            <div className="promo-value">{countLoading ? '...' : totalCount}</div>
            <p className="promo-caption">thank you moments</p>
            <div className="promo-bar">
              <span style={{ width: `${Math.min(100, ((totalCount || 0) / 50) * 100)}%` }} />
            </div>
            <p className="promo-footnote">Next milestone: 50</p>
            <button type="button" className="promo-button" onClick={() => scrollToSection('badges')}>
              View badges
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          <header className="dashboard-topbar">
            <div className="topbar-tabs">
              {topNavItems.map((item) => (
                <Link key={item.label} to={item.to} className={`top-tab ${item.active ? 'active' : ''}`}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="topbar-user">
              <div className="avatar-badge">{firstName.slice(0, 1).toUpperCase()}</div>
              <div className="user-meta">
                <span className="user-name">{firstName}</span>
                <span className="user-email">{user?.email}</span>
              </div>
              <button type="button" className="logout-chip" onClick={logout}>👋 Logout</button>
            </div>
          </header>

          <div className="main-grid">
            <div className="main-column">
              <section className="hero-panel" ref={sectionRefs.dashboard}>
                <div className="hero-copy">
                  <div className="hero-kicker">✦ ✦</div>
                  <h1 className="gradient-text">Thank You Moments</h1>
                  <p className="hero-subtitle">A celebration of gratitude and appreciation</p>
                  <p className="hero-message">Every moment counts. Every thank you is cherished.</p>

                  <div className="hero-bubble">Sending good vibes your way!</div>
                </div>

                <div className="hero-landscape" aria-hidden="true">
                  <div className="hero-tulip-field">
                    {Array.from({ length: 26 }).map((_, index) => (
                      <div
                        key={index}
                        className={`tulip-row tulip-row-${(index % 4) + 1} ${index % 3 === 0 ? 'tall' : ''} ${index % 5 === 0 ? 'small' : ''}`}
                        style={{ '--offset': `${index * 3.9}%` }}
                      >
                        <span className="bloom" />
                        <span className="stem" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hero-visual" aria-hidden="true">
                  <div className="hero-star star-a">✦</div>
                  <div className="hero-star star-b">✦</div>
                  <div className="hero-star star-c">✦</div>
                  <StickerMedia
                    sticker={heroSticker}
                    className="hero-sticker-image"
                    fallbackClassName="hero-sticker-fallback"
                  />
                </div>
              </section>

              <section className="stats-strip" ref={sectionRefs.analytics}>
                <div className="stats-row">
                  {statCards.map((card, index) => (
                    <motion.article
                      key={card.label}
                      className="stat-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * index }}
                    >
                      <div className={`stat-icon ${card.iconClass}`}>{card.icon}</div>
                      <div className="stat-content">
                        <div className="stat-value">{card.value}</div>
                        <div className="stat-label">{card.label}</div>
                        <div className="stat-hint">{card.hint}</div>
                      </div>
                    </motion.article>
                  ))}
                </div>

                <div className="mini-cheer card-glass">
                  <div className="mini-cheer-title">Gratitude is like a boomerang</div>
                  <div className="mini-cheer-copy">it always comes back! 😊</div>
                </div>
              </section>

              <section className="journey-panel card-glass" ref={sectionRefs.moments}>
                <div className="journey-header">
                  <div>
                    <h2>Gratitude Journey</h2>
                    <p>A polished 6-moment preview. Open My Moments for the full archive.</p>
                  </div>
                  <div className="journey-actions">
                    <span className="preview-chip">{homePreviewEntries.length} preview cards</span>
                    <Link to="/moments" className="filter-chip">♡ View All</Link>
                  </div>
                </div>

                {entries.length === 0 ? (
                  <div className="empty-journey">
                    <div className="empty-journey-icon">✦</div>
                    <p>No thank you moments yet. Start with your first note.</p>
                  </div>
                ) : (
                  <div className="home-moments-grid">
                    <div className="journey-branch-line" aria-hidden="true">
                      <svg viewBox="0 0 1000 760" preserveAspectRatio="none">
                        <path
                          d="M140 90
                             C280 90, 340 130, 470 170
                             S720 250, 840 180
                             C900 150, 900 250, 830 300
                             C730 370, 620 330, 520 390
                             S250 500, 150 460
                             C90 435, 90 540, 170 590
                             C300 670, 520 620, 690 610
                             S860 650, 900 700"
                          className="branch-path"
                        />
                        {[
                          { cx: 136, cy: 90 },
                          { cx: 844, cy: 180 },
                          { cx: 150, cy: 460 },
                          { cx: 900, cy: 700 },
                        ].map((node, index) => (
                          <circle key={index} {...node} r="10" className="branch-node" />
                        ))}
                      </svg>
                    </div>
                    {homePreviewEntries.map((entry, index) => {
                      const sticker = getEntrySticker(entry);
                      const entryDate = entry.date?.toDate?.() || new Date(entry.date);

                      return (
                        <article
                          key={entry.id}
                          className={`home-moment-card card-glass ${entry.isSpecial ? 'special' : ''} ${index % 2 === 0 ? 'tilt-left' : 'tilt-right'}`}
                        >
                          <div className="home-moment-main">
                            <div className="home-moment-head">
                              <div>
                                <h3>{entry.title}</h3>
                                <p className="home-moment-date">
                                  📅 {entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                              {entry.isSpecial && <span className="badge badge-special">⭐ Special</span>}
                            </div>

                            <div className="home-moment-count">
                              <span className="count-badge">+{entry.countAdded || 1}</span>
                              <span className="count-label">points</span>
                            </div>
                          </div>

                          <div className="home-moment-media">
                            <StickerMedia
                              sticker={sticker}
                              className="home-moment-media-asset"
                              fallbackClassName="home-moment-media-fallback"
                            />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="bottom-sections">
                <div className="section-card card-glass" ref={sectionRefs.calendar}>
                  <h3>Calendar Snapshot</h3>
                  <div className="mini-list">
                    {recentMonths.length > 0 ? recentMonths.map((month) => (
                      <div key={month.label} className="mini-list-row">
                        <span>{month.label}</span>
                        <span>{month.count} notes</span>
                      </div>
                    )) : <p>No month data yet.</p>}
                  </div>
                </div>

                <div className="section-card card-glass" ref={sectionRefs.badges}>
                  <h3>Badge Shelf</h3>
                  <div className="badge-shelf">
                    <div className="badge-pill">✨ First Note</div>
                    <div className="badge-pill">💙 Kind Soul</div>
                    <div className="badge-pill">🌟 Memory Maker</div>
                    <div className="badge-pill">🎉 Special Moment</div>
                  </div>
                </div>

                <div className="section-card card-glass" ref={sectionRefs.settings}>
                  <h3>Badmosh On the top</h3>
                  <div className="bonus-meme-slot">
                    <StickerMedia
                      sticker={bonusMeme}
                      className="bonus-meme-image"
                      fallbackClassName="bonus-meme-fallback"
                    />
                  </div>
                </div>
              </section>
            </div>

            <aside className="right-rail">
              <section className="rail-ard card-glass tips-card">
                <h3> 🐦‍⬛General Advice for Chirkut</h3>
                <div className="tips-bubble">You are Awsome my Patle domst 😎</div>
                <div className="tips-list">
                  {tips.map((tip) => (
                    <div key={tip} className="tip-item">
                      <span className="tip-emoji">🐦‍⬛</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rail-card card-glass meme-card">
                <h3>Meme Break</h3>
                <p>Because gratitude + memes = happiness 😄</p>
                <StickerMedia
                  sticker={memeBreak}
                  className="meme-image"
                  fallbackClassName="meme-fallback"
                />
                <div className="meme-actions">
                  <button type="button" className="meme-button">😂 Need another meme?</button>
                  <button type="button" className="meme-button secondary">Hit Me!</button>
                </div>
              </section>

              <section className="rail-card streak-card">
                <div className="streak-bird">🐥</div>
                <div>
                  <h4>You're on a roll! 🚀</h4>
                  <p>Keep creating those thank you moments!</p>
                  <div className="streak-bar"><span style={{ width: '75%' }} /></div>
                  <small>75% to next milestone</small>
                </div>
              </section>
            </aside>
          </div>

          <section className="footer-strip">
            {footerPills.map((pill) => (
              <div key={pill.title} className="footer-pill card-glass">
                <div className="footer-pill-emoji">{pill.emoji}</div>
                <div>
                  <div className="footer-pill-title">{pill.title}</div>
                  <div className="footer-pill-copy">{pill.text}</div>
                </div>
              </div>
            ))}
            <div className="footer-badge">Gratitude: It's free, easy and totally worth it! 😊</div>
          </section>
        </main>
      </div>

      <style>{`
        .public-dashboard {
          padding: 20px 16px 28px;
          max-width: 1640px;
          margin: 0 auto;
        }

        .dashboard-shell {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          gap: 20px;
          min-height: calc(100vh - 90px);
          padding: 16px;
          border-radius: 32px;
          background:
            radial-gradient(circle at top left, rgba(255, 255, 255, 0.94), rgba(243, 248, 255, 0.88) 52%, rgba(232, 242, 255, 0.74)),
            rgba(255, 255, 255, 0.68);
          box-shadow: 0 24px 60px rgba(74, 112, 175, 0.12);
        }

        .dashboard-sidebar {
          border-right: 1px solid rgba(121, 174, 252, 0.12);
          padding: 6px 14px 6px 2px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .brand-mark {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.52);
          border: 1px solid rgba(121, 174, 252, 0.12);
        }

        .brand-icon {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, rgba(255, 209, 96, 0.28), rgba(121, 174, 252, 0.18));
          color: #f3bc3f;
          font-size: 16px;
        }

        .brand-name {
          font-size: 24px;
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #163b78;
        }

        .brand-subtitle {
          font-size: 12px;
          color: var(--text-light);
          margin-top: 2px;
        }

        .side-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .side-nav-item {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
          padding: 12px 14px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 600;
          transition: all var(--transition-fast);
        }

        .side-nav-item.active {
          background: linear-gradient(135deg, rgba(121, 174, 252, 0.16), rgba(185, 212, 255, 0.24));
          color: var(--text-primary);
          box-shadow: inset 0 0 0 1px rgba(121, 174, 252, 0.1);
        }

        .side-nav-item:hover {
          background: rgba(121, 174, 252, 0.08);
          color: var(--text-primary);
        }

        .side-icon {
          width: 18px;
          text-align: center;
          color: var(--primary-blush);
        }

        .sidebar-meme {
          padding: 10px;
          border-radius: 20px;
        }

        .sidebar-meme-image,
        .sidebar-meme-fallback {
          width: 100%;
          border-radius: 14px;
          min-height: 112px;
          background: linear-gradient(135deg, rgba(255, 215, 130, 0.9), rgba(255, 242, 214, 0.95));
          display: grid;
          place-items: center;
          font-size: 48px;
          color: #314974;
          object-fit: cover;
        }

        .sidebar-meme-fallback,
        .meme-fallback {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          padding: 16px;
        }

        .sidebar-meme-fallback span,
        .meme-fallback span {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .sidebar-promo {
          margin-top: auto;
          border-radius: 24px;
          padding: 20px 18px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(235, 244, 255, 0.72));
          border: 1px solid rgba(121, 174, 252, 0.16);
          text-align: center;
        }

        .promo-title {
          color: var(--text-primary);
          font-weight: 700;
          margin-bottom: 12px;
        }

        .promo-caption,
        .promo-footnote {
          font-size: 12px;
          color: var(--text-light);
          margin-bottom: 6px;
        }

        .promo-value {
          font-size: 42px;
          line-height: 1;
          color: var(--primary-blush);
          font-weight: 800;
          margin: 10px 0;
        }

        .promo-bar {
          height: 8px;
          background: rgba(121, 174, 252, 0.12);
          border-radius: 999px;
          overflow: hidden;
          margin: 16px 0 10px;
        }

        .promo-bar span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: var(--gradient-soft);
        }

        .promo-button {
          margin-top: 10px;
          border: 1px solid rgba(121, 174, 252, 0.16);
          background: rgba(255, 255, 255, 0.75);
          color: var(--text-primary);
          border-radius: 14px;
          padding: 10px 14px;
          font-weight: 700;
          font-size: 13px;
        }

        .dashboard-main {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dashboard-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 2px 4px 0;
        }

        .topbar-tabs {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .top-tab {
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

        .top-tab.active {
          color: var(--primary-blush);
          background: rgba(121, 174, 252, 0.12);
        }

        .topbar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.76);
          border: 1px solid rgba(121, 174, 252, 0.1);
          min-width: 0;
        }

        .avatar-badge {
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

        .user-meta {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .user-name {
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .user-email {
          color: var(--text-light);
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }

        .logout-chip {
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

        .main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          gap: 16px;
          align-items: start;
        }

        .main-column {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .hero-panel {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(220px, 0.75fr);
          align-items: center;
          gap: 14px;
          min-height: 180px;
          padding: 24px 26px;
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(180deg, rgba(244, 249, 255, 0.98) 0%, rgba(227, 238, 255, 0.94) 54%, rgba(202, 194, 244, 0.84) 82%, rgba(178, 149, 215, 0.78) 100%);
          border: 1px solid rgba(121, 174, 252, 0.16);
        }

        .hero-copy {
          position: relative;
          z-index: 3;
          max-width: 540px;
          padding-bottom: 20px;
        }

        .hero-kicker {
          color: var(--primary-blush);
          font-size: 22px;
          margin-bottom: 4px;
        }

        .hero-panel h1 {
          margin-bottom: 8px;
          font-size: clamp(34px, 4.5vw, 52px);
        }

        .hero-subtitle {
          color: rgba(26, 47, 82, 0.88);
          font-size: 18px;
          margin-bottom: 10px;
        }

        .hero-message {
          color: rgba(34, 56, 95, 0.86);
          font-size: 15px;
          font-style: italic;
          margin: 0;
        }

        .hero-bubble {
          display: inline-flex;
          margin-top: 16px;
          padding: 12px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 700;
        }

        .hero-landscape {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .hero-tulip-field {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 118px;
          overflow: hidden;
          background:
            linear-gradient(180deg, rgba(126, 109, 188, 0) 0%, rgba(183, 126, 214, 0.22) 30%, rgba(159, 87, 182, 0.56) 74%, rgba(118, 57, 134, 0.78) 100%);
        }

        .hero-tulip-field::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 12% 100%, rgba(255, 111, 228, 0.22) 0 74px, transparent 75px),
            radial-gradient(circle at 31% 102%, rgba(246, 94, 220, 0.24) 0 84px, transparent 85px),
            radial-gradient(circle at 51% 98%, rgba(255, 120, 232, 0.2) 0 80px, transparent 81px),
            radial-gradient(circle at 70% 104%, rgba(240, 88, 214, 0.24) 0 88px, transparent 89px),
            radial-gradient(circle at 88% 100%, rgba(255, 126, 234, 0.2) 0 78px, transparent 79px);
          opacity: 0.72;
        }

        .tulip-row {
          position: absolute;
          bottom: -6px;
          left: var(--offset);
          width: 22px;
          display: flex;
          justify-content: center;
          transform-origin: bottom center;
          animation: tulip-sway 5.5s ease-in-out infinite;
          z-index: 2;
        }

        .tulip-row.small {
          transform: scale(0.84);
        }

        .tulip-row.tall {
          transform: scale(1.12);
        }

        .tulip-row .stem {
          width: 4px;
          height: 42px;
          border-radius: 999px;
          background: linear-gradient(180deg, #376a37 0%, #1c401f 100%);
          opacity: 0.92;
        }

        .tulip-row .bloom {
          position: absolute;
          bottom: 31px;
          width: 19px;
          height: 22px;
          border-radius: 18px 18px 10px 10px;
          box-shadow: 0 6px 14px rgba(83, 25, 76, 0.16);
        }

        .tulip-row .bloom::before,
        .tulip-row .bloom::after {
          content: '';
          position: absolute;
          bottom: 8px;
          width: 12px;
          height: 14px;
          border-radius: 14px 14px 0 0;
          background: inherit;
        }

        .tulip-row .bloom::before {
          left: -1px;
          transform: rotate(-14deg);
        }

        .tulip-row .bloom::after {
          right: -1px;
          transform: rotate(14deg);
        }

        .tulip-row-1 .bloom {
          background: linear-gradient(180deg, #ff6fe0 0%, #d93dd4 100%);
        }

        .tulip-row-2 .bloom {
          background: linear-gradient(180deg, #ff84ef 0%, #ce2dc2 100%);
        }

        .tulip-row-3 .bloom {
          background: linear-gradient(180deg, #f763ff 0%, #b92cc4 100%);
        }

        .tulip-row-4 .bloom {
          background: linear-gradient(180deg, #ff8ef2 0%, #cb35aa 100%);
        }

        .hero-visual {
          position: relative;
          height: 182px;
          min-width: 0;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          z-index: 2;
          padding: 20px 10px 18px 0;
        }

        .hero-star {
          position: absolute;
          color: rgba(121, 174, 252, 0.45);
          font-size: 16px;
        }

        .star-a {
          top: 10px;
          left: 20px;
        }

        .star-b {
          top: 44px;
          right: 26px;
          color: rgba(245, 196, 81, 0.72);
        }

        .star-c {
          bottom: 18px;
          left: 26px;
          color: rgba(185, 212, 255, 0.85);
        }

        .hero-sticker-image,
        .hero-sticker-fallback {
          width: 100%;
          max-width: 212px;
          min-height: 136px;
          object-fit: contain;
          display: grid;
          place-items: center;
          font-size: 56px;
          border-radius: 20px;
          color: #335d94;
          background: transparent;
        }

        @keyframes tulip-sway {
          0%, 100% {
            transform: rotate(-2deg) translateY(0);
          }
          50% {
            transform: rotate(2deg) translateY(-2px);
          }
        }

        .stats-strip {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 130px;
          gap: 12px;
          align-items: stretch;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          border-radius: 20px;
          padding: 16px 14px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(121, 174, 252, 0.12);
          box-shadow: 0 10px 22px rgba(92, 125, 181, 0.06);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .stat-icon.blue {
          background: rgba(121, 174, 252, 0.14);
          color: #4d87e7;
        }

        .stat-icon.rose {
          background: rgba(255, 134, 173, 0.12);
          color: #ff7ba4;
        }

        .stat-icon.gold {
          background: rgba(245, 196, 81, 0.16);
          color: #e3ab22;
        }

        .stat-icon.violet {
          background: rgba(159, 127, 255, 0.12);
          color: #8b70ec;
        }

        .stat-value {
          font-size: 30px;
          line-height: 1;
          color: var(--text-primary);
          font-weight: 800;
          margin-bottom: 4px;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-hint {
          color: #4eab72;
          font-size: 11px;
          font-weight: 700;
        }

        .mini-cheer {
          padding: 14px 12px;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }

        .mini-cheer-title {
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 700;
          line-height: 1.3;
        }

        .mini-cheer-copy {
          color: var(--text-secondary);
          font-size: 12px;
          margin-top: 8px;
        }

        .journey-panel {
          padding: 18px 18px 16px;
          border-radius: 24px;
          border: 1px solid rgba(121, 174, 252, 0.12);
          background: rgba(255, 255, 255, 0.56);
        }

        .journey-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }

        .journey-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .journey-header h2 {
          margin-bottom: 4px;
          font-size: 30px;
        }

        .journey-header p {
          margin: 0;
          font-size: 13px;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(121, 174, 252, 0.14);
          background: rgba(255, 255, 255, 0.74);
          color: var(--primary-blush);
          border-radius: 999px;
          padding: 10px 14px;
          font-weight: 700;
          font-size: 12px;
          white-space: nowrap;
        }

        .preview-chip {
          display: inline-flex;
          align-items: center;
          padding: 10px 12px;
          border-radius: 999px;
          background: rgba(121, 174, 252, 0.08);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .empty-journey {
          text-align: center;
          padding: 54px 24px;
          color: var(--text-secondary);
        }

        .empty-journey-icon {
          font-size: 42px;
          color: var(--primary-blush);
          margin-bottom: 12px;
        }

        .home-moments-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          padding: 10px 4px 4px;
        }

        .home-moment-card {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 92px;
          gap: 10px;
          padding: 14px;
          border-radius: 20px;
          align-items: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 24px rgba(99, 133, 191, 0.08);
          position: relative;
          z-index: 2;
        }

        .home-moment-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.18), transparent 42%);
          pointer-events: none;
        }

        .home-moment-card.tilt-left {
          transform: rotate(-0.4deg);
        }

        .home-moment-card.tilt-right {
          transform: rotate(0.4deg);
          margin-top: 28px;
        }

        .home-moment-card:hover {
          transform: translateY(-3px) rotate(0deg);
        }

        .journey-branch-line {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          opacity: 1;
        }

        .journey-branch-line svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .branch-path {
          fill: none;
          stroke: rgba(121, 174, 252, 0.72);
          stroke-width: 10;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 12 14;
          filter: drop-shadow(0 8px 12px rgba(121, 174, 252, 0.22));
        }

        .branch-node {
          fill: #ffffff;
          stroke: rgba(121, 174, 252, 1);
          stroke-width: 6;
        }

        .home-moment-head {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .home-moment-head h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .home-moment-date {
          margin: 0;
          font-size: 12px;
          color: var(--text-light);
        }

        .home-moment-count {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 10px;
          border-top: 1px solid rgba(121, 174, 252, 0.14);
        }

        .home-moment-media {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .home-moment-media-asset,
        .home-moment-media-fallback {
          width: 100%;
          min-height: 76px;
          border-radius: 14px;
          object-fit: cover;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, rgba(233, 243, 255, 0.9), rgba(198, 219, 255, 0.95));
          color: #2f588b;
        }

        .home-moment-media-fallback {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          padding: 8px;
        }

        .home-moment-media-fallback span {
          font-size: 10px;
          color: var(--text-secondary);
        }

        .bottom-sections {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .section-card {
          padding: 16px;
          border-radius: 20px;
        }

        .section-card h3 {
          font-size: 18px;
          margin-bottom: 10px;
        }

        .mini-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mini-list-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          color: var(--text-secondary);
          font-size: 13px;
          padding-bottom: 8px;
          border-bottom: 1px dashed rgba(121, 174, 252, 0.16);
        }

        .badge-shelf {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .badge-pill {
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(121, 174, 252, 0.12);
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 700;
        }

        .bonus-meme-slot {
          margin-top: 6px;
        }

        .bonus-meme-image,
        .bonus-meme-fallback {
          width: 100%;
          min-height: 180px;
          border-radius: 18px;
          object-fit: cover;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, rgba(233, 243, 255, 0.9), rgba(198, 219, 255, 0.95));
          color: #2f588b;
        }

        .bonus-meme-fallback {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          text-align: center;
          font-size: 34px;
          font-weight: 700;
          padding: 16px;
        }

        .bonus-meme-fallback span {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .right-rail {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .rail-card {
          padding: 16px;
          border-radius: 22px;
        }

        .tips-card h3,
        .meme-card h3 {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .tips-bubble {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 18px;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 14px;
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tip-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 13px;
          color: var(--text-secondary);
          padding-bottom: 12px;
          border-bottom: 1px dashed rgba(121, 174, 252, 0.16);
        }

        .tip-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .tip-emoji {
          font-size: 20px;
          line-height: 1;
        }

        .meme-card p {
          font-size: 13px;
          margin-bottom: 12px;
        }

        .meme-image,
        .meme-fallback {
          width: 100%;
          min-height: 156px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(233, 243, 255, 0.9), rgba(198, 219, 255, 0.95));
          display: grid;
          place-items: center;
          font-size: 52px;
          color: #2f588b;
          object-fit: cover;
          margin-bottom: 12px;
        }

        .meme-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .meme-button {
          border: 1px solid rgba(121, 174, 252, 0.16);
          background: rgba(255, 255, 255, 0.8);
          color: var(--text-primary);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .meme-button.secondary {
          color: var(--primary-blush);
        }

        .streak-card {
          display: grid;
          grid-template-columns: 54px minmax(0, 1fr);
          gap: 12px;
          align-items: center;
          background: linear-gradient(135deg, rgba(255, 241, 171, 0.38), rgba(228, 238, 255, 0.92));
        }

        .streak-bird {
          font-size: 42px;
          text-align: center;
        }

        .streak-card h4 {
          font-size: 18px;
          margin-bottom: 4px;
        }

        .streak-card p {
          font-size: 13px;
          margin-bottom: 10px;
        }

        .streak-bar {
          height: 8px;
          background: rgba(121, 174, 252, 0.12);
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .streak-bar span {
          display: block;
          height: 100%;
          background: var(--gradient-soft);
        }

        .streak-card small {
          color: var(--text-light);
        }

        .footer-strip {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 10px;
        }

        .footer-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 12px;
          border-radius: 18px;
        }

        .footer-pill-emoji {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(121, 174, 252, 0.12);
          font-size: 18px;
          flex-shrink: 0;
        }

        .footer-pill-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .footer-pill-copy {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 3px;
        }

        .footer-badge {
          display: grid;
          place-items: center;
          padding: 14px 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(227, 238, 255, 0.95));
          border: 1px solid rgba(121, 174, 252, 0.14);
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 700;
          text-align: center;
        }

        @media (max-width: 1400px) {
          .main-grid {
            grid-template-columns: 1fr;
          }

          .right-rail {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .footer-strip {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1240px) {
          .stats-strip {
            grid-template-columns: 1fr;
          }

          .stats-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .home-moments-grid {
            grid-template-columns: 1fr;
          }

          .journey-branch-line {
            display: none;
          }

          .home-moment-card.tilt-right {
            margin-top: 0;
          }

          .bottom-sections {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 980px) {
          .dashboard-shell {
            grid-template-columns: 1fr;
          }

          .dashboard-sidebar {
            border-right: none;
            border-bottom: 1px solid rgba(121, 174, 252, 0.12);
            padding-right: 0;
            padding-bottom: 18px;
          }

          .side-nav {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .sidebar-promo {
            margin-top: 0;
          }

          .hero-panel {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .hero-visual {
            height: 150px;
            align-items: flex-end;
            justify-content: flex-end;
            padding: 12px 2px 14px 0;
          }

          .hero-tulip-field {
            height: 92px;
          }

          .tulip-row .stem {
            height: 30px;
          }

          .tulip-row .bloom {
            width: 15px;
            height: 17px;
            bottom: 23px;
          }

          .right-rail {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .public-dashboard {
            padding: 14px 10px 24px;
          }

          .dashboard-shell {
            padding: 12px;
            gap: 14px;
            border-radius: 24px;
          }

          .dashboard-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .topbar-user {
            width: 100%;
            justify-content: center;
          }

          .side-nav {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .stats-row,
          .footer-strip {
            grid-template-columns: 1fr;
          }

          .journey-header {
            flex-direction: column;
          }

          .hero-panel {
            padding: 20px 16px;
            padding-bottom: 80px;
            gap: 8px;
          }

          .hero-copy {
            padding-bottom: 0;
          }

          .hero-panel h1 {
            font-size: 30px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .hero-message {
            font-size: 14px;
          }

          .hero-bubble {
            padding: 10px 14px;
            font-size: 12px;
          }

          .hero-visual {
            height: 106px;
            justify-content: flex-end;
            padding: 0 0 8px;
          }

          .hero-sticker-image,
          .hero-sticker-fallback {
            max-width: 144px;
            min-height: 90px;
          }

          .hero-tulip-field {
            height: 62px;
          }

          .tulip-row {
            width: 12px;
            bottom: -3px;
          }

          .tulip-row .stem {
            width: 3px;
            height: 18px;
          }

          .tulip-row .bloom {
            width: 10px;
            height: 11px;
            bottom: 12px;
          }

          .tulip-row:nth-child(n + 15) {
            display: none;
          }

          .hero-star {
            display: none;
          }
        }

        @media (max-width: 520px) {
          .dashboard-shell {
            padding: 10px;
          }

          .dashboard-sidebar {
            gap: 14px;
          }

          .hero-panel {
            padding: 18px 14px 66px;
            border-radius: 22px;
          }

          .hero-panel h1 {
            font-size: 27px;
          }

          .hero-subtitle {
            font-size: 15px;
          }

          .hero-message {
            font-size: 13px;
          }

          .hero-bubble {
            margin-top: 12px;
          }

          .hero-visual {
            height: 82px;
          }

          .hero-sticker-image,
          .hero-sticker-fallback {
            max-width: 118px;
            min-height: 74px;
          }

          .hero-tulip-field {
            height: 50px;
          }

          .hero-tulip-field::before {
            opacity: 0.58;
          }

          .tulip-row {
            width: 10px;
          }

          .tulip-row .stem {
            width: 2px;
            height: 14px;
          }

          .tulip-row .bloom {
            width: 8px;
            height: 9px;
            bottom: 8px;
          }

          .tulip-row:nth-child(n + 12) {
            display: none;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default PublicView;
