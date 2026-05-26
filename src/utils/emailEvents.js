const EMAIL_EVENT_ENDPOINT = '/api/send-email-event';
const EMAIL_EVENT_APP = 'body1';
const EMAIL_EVENT_TO = import.meta.env.VITE_FRIEND_EMAIL || 'bees7722@gmail.com';

export const sendEmailEvent = async (event, options = {}) => {
  const payload = {
    app: EMAIL_EVENT_APP,
    event,
    to: options.to || EMAIL_EVENT_TO,
  };

  console.info('[email-event] sending request', {
    endpoint: EMAIL_EVENT_ENDPOINT,
    payload,
    sentAt: new Date().toISOString(),
  });

  const response = await fetch(EMAIL_EVENT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('[email-event] request failed', {
      status: response.status,
      statusText: response.statusText,
      data,
    });
    throw new Error(data?.message || `Email event failed with status ${response.status}`);
  }

  console.info('[email-event] request succeeded', {
    status: response.status,
    data,
  });

  return data;
};
