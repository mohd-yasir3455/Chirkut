import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

const REMOTE_EMAIL_ENDPOINT = 'https://email-server-n4by.onrender.com/send';
const DEFAULT_REMINDER_EMAIL = 'thedarklife3455@gmail.com';

initializeApp();
const db = getFirestore();

const setCorsHeaders = (res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
};

export const sendEmailEvent = onRequest(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const response = await fetch(REMOTE_EMAIL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body ?? {}),
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Email proxy failed:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Email proxy failed',
    });
  }
});

const postRemoteEmailEvent = async (payload) => {
  const response = await fetch(REMOTE_EMAIL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  try {
    return { ok: response.ok, status: response.status, data: JSON.parse(text) };
  } catch {
    return { ok: response.ok, status: response.status, data: { raw: text } };
  }
};

export const sendHealthReminders = onSchedule(
  {
    schedule: '15 9 * * *',
    timeZone: 'Asia/Kolkata',
    memory: '256MiB',
  },
  async () => {
    const now = Timestamp.now();
    const snapshot = await db
      .collection('menstrual_trackers')
      .where('reminderEnabled', '==', true)
      .where('reminderSentForCycle', '==', false)
      .where('nextReminderDate', '<=', now)
      .get();

    if (snapshot.empty) {
      console.info('No health reminders due right now.');
      return;
    }

    for (const trackerDoc of snapshot.docs) {
      const tracker = trackerDoc.data();
      const email = tracker.reminderEmail || DEFAULT_REMINDER_EMAIL;

      try {
        const result = await postRemoteEmailEvent({
          app: 'body1',
          event: 'health',
          to: email,
        });

        if (!result.ok) {
          throw new Error(`Remote email server returned ${result.status}`);
        }

        await trackerDoc.ref.update({
          reminderSentForCycle: true,
          lastHealthReminderSentAt: now,
          lastHealthReminderResponse: result.data?.response || 'accepted',
        });

        console.info('Health reminder sent', {
          trackerId: trackerDoc.id,
          email,
          response: result.data,
        });
      } catch (error) {
        console.error('Failed to send health reminder', {
          trackerId: trackerDoc.id,
          email,
          error: error instanceof Error ? error.message : error,
        });
      }
    }
  }
);
