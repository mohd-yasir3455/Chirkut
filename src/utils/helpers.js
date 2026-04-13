// src/utils/helpers.js

/**
 * Format a Firestore timestamp to readable date
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate?.() || new Date(timestamp);
  
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Format date for display (relative time)
 */
export const formatRelativeDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate?.() || new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  
  return formatDate(timestamp);
};

/**
 * Get month/year label for grouping
 */
export const getMonthLabel = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate?.() || new Date(timestamp);
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};

/**
 * Group entries by month
 */
export const groupByMonth = (entries) => {
  const grouped = {};
  
  entries.forEach((entry) => {
    const monthLabel = getMonthLabel(entry.date);
    if (!grouped[monthLabel]) {
      grouped[monthLabel] = [];
    }
    grouped[monthLabel].push(entry);
  });
  
  return grouped;
};

/**
 * Search entries by title or description
 */
export const searchEntries = (entries, query) => {
  if (!query) return entries;
  
  const lowerQuery = query.toLowerCase();
  return entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.description?.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Trigger confetti animation
 */
export const triggerConfetti = (count = 50) => {
  if (typeof window === 'undefined') return;
  
  // Use canvas-based confetti if library is loaded
  if (window.confetti) {
    window.confetti({
      particleCount: count,
      spread: 70,
      origin: { y: 0.6 },
    });
  }
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = (text) => {
  if (typeof window === 'undefined') return;
  
  navigator.clipboard.writeText(text).then(() => {
    console.log('Copied to clipboard');
  }).catch((err) => {
    console.error('Failed to copy:', err);
  });
};

/**
 * Generate random encouraging message
 */
export const getRandomMessage = () => {
  const messages = [
    '✨ You\'re doing amazing!',
    '💝 Every thank you matters!',
    '🌟 Gratitude looks good on you!',
    '💫 Keep spreading kindness!',
    '🎉 This moment is special!',
    '🌸 Beautiful gratitude!',
    '💖 Love what you\'re doing!',
    '✨ Making a difference!',
    '🎊 Celebrating you!',
    '💕 This is wonderful!',
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Calculate remaining count
 */
export const calculateRemaining = (totalCount, paidCount) => {
  return Math.max(0, totalCount - paidCount);
};

/**
 * Get progress percentage
 */
export const getProgressPercentage = (total, current) => {
  if (total === 0) return 0;
  return Math.min(100, (current / total) * 100);
};

/**
 * Format large numbers with abbreviations
 */
export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

/**
 * Delay function for animations
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a random id
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Animate number counter
 */
export const animateCounter = (element, start, end, duration = 500) => {
  let current = start;
  const range = end - start;
  const increment = range / (duration / 16); // ~60fps
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    if (element) {
      element.textContent = Math.floor(current);
    }
  }, 16);
};
