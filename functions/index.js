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

// Test email function
exports.testEmail = functions.https.onRequest(async (req, res) => {
  try {
    const { sendNewEntryEmail } = require('./sendEmailNotification');
    
    // Create a test email by calling the function directly
    const testData = {
      title: 'Test Email Notification',
      description: 'This is a test email to verify the notification system is working.',
      countAdded: 1,
      date: admin.firestore.Timestamp.now()
    };
    
    // Simulate a document creation
    await admin.firestore().collection('test_emails').add(testData);
    
    res.json({ 
      success: true, 
      message: 'Test email triggered! Check both admin and friend emails.',
      testData: testData
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: error.message });
  }
});
