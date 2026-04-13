// functions/index.js
const functions = require('firebase-functions');
const {
  sendNewEntryEmail,
  sendUpdateEmail,
  sendPaidEmail,
} = require('./sendEmailNotification');

// Export all email notification functions
exports.sendNewEntryEmail = sendNewEntryEmail;
exports.sendUpdateEmail = sendUpdateEmail;
exports.sendPaidEmail = sendPaidEmail;

// Optional: Health check function
exports.healthCheck = functions.https.onRequest((req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
