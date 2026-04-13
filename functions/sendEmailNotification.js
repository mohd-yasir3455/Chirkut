// functions/sendEmailNotification.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// Configure email service (using Gmail or your email provider)
// For Gmail: Enable 2FA and create an App Password
// https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || functions.config().gmail.email,
    pass: process.env.GMAIL_PASSWORD || functions.config().gmail.password,
  },
});

// Alternative: SendGrid
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || functions.config().emails.admin;
const FRIEND_EMAIL = process.env.FRIEND_EMAIL || functions.config().emails.friend;

/**
 * Cloud Function: Triggers when a new thankyou entry is added
 */
exports.sendNewEntryEmail = functions.firestore
  .document('thankyou_entries/{docId}')
  .onCreate(async (snap, context) => {
    try {
      const data = snap.data();
      const entryId = context.params.docId;
      
      // Format the date
      const entryDate = data.date?.toDate?.() || new Date();
      const formattedDate = entryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      // Get current total count
      const configDoc = await admin.firestore().collection('config').doc('main').get();
      const totalCount = configDoc.data()?.totalThankyouCount || 0;
      
      // Email HTML template
      const emailHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #FFB5D8 0%, #E8D4F8 100%); padding: 20px; }
              .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .title { font-size: 28px; color: #FFB5D8; font-weight: bold; margin: 0; }
              .subtitle { font-size: 14px; color: #6B6B6B; margin: 5px 0 0 0; }
              .content { background: #FFF8F0; padding: 20px; border-radius: 15px; margin: 20px 0; }
              .entry-title { font-size: 18px; color: #2D2D2D; font-weight: 600; margin: 0; }
              .entry-date { font-size: 12px; color: #9B9B9B; margin: 5px 0; }
              .entry-description { font-size: 14px; color: #4D4D4D; margin: 15px 0 0 0; line-height: 1.6; }
              .stats { display: flex; justify-content: space-around; margin: 25px 0; text-align: center; }
              .stat-box { background: linear-gradient(135deg, #FFE8D6 0%, #D4F8E8 100%); padding: 15px; border-radius: 10px; flex: 1; margin: 0 10px; }
              .stat-number { font-size: 32px; font-weight: bold; color: #FFB5D8; }
              .stat-label { font-size: 12px; color: #6B6B6B; margin-top: 5px; }
              .button { display: inline-block; background: linear-gradient(135deg, #FFB5D8 0%, #E8D4F8 100%); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; margin-top: 20px; text-align: center; }
              .footer { text-align: center; color: #9B9B9B; font-size: 12px; margin-top: 30px; }
              .confetti { display: inline-block; font-size: 20px; margin: 0 3px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 class="title"><span class="confetti">✨</span> New Thank You Moment <span class="confetti">✨</span></h1>
                <p class="subtitle">A beautiful moment to celebrate</p>
              </div>
              
              <div class="content">
                <h2 class="entry-title">${escapeHtml(data.title)}</h2>
                <p class="entry-date">📅 ${formattedDate}</p>
                ${data.description ? `<p class="entry-description">${escapeHtml(data.description)}</p>` : ''}
              </div>
              
              <div class="stats">
                <div class="stat-box">
                  <div class="stat-number">+${data.countAdded || 1}</div>
                  <div class="stat-label">Thank You Points</div>
                </div>
                <div class="stat-box">
                  <div class="stat-number">${totalCount}</div>
                  <div class="stat-label">Total Count</div>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.APP_URL || 'https://thank-you-tracker.web.app'}" class="button">View on Tracker</a>
              </div>
              
              <div class="footer">
                <p>💌 Thank You Tracker - Celebrating gratitude moments</p>
              </div>
            </div>
          </body>
        </html>
      `;
      
      // Send emails to both admin and friend
      const mailOptions = {
        from: ADMIN_EMAIL,
        to: `${ADMIN_EMAIL}, ${FRIEND_EMAIL}`,
        subject: `✨ New Thank You: ${data.title}`,
        html: emailHTML,
      };
      
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully for new entry:', entryId);
      
    } catch (error) {
      console.error('Error sending email for new entry:', error);
      // Don't throw - we don't want function to fail if email fails
    }
  });

/**
 * Cloud Function: Triggers when thank you entry is updated
 */
exports.sendUpdateEmail = functions.firestore
  .document('thankyou_entries/{docId}')
  .onUpdate(async (change, context) => {
    try {
      const oldData = change.before.data();
      const newData = change.after.data();
      
      // Only send if count was increased
      const oldCount = oldData.countAdded || 0;
      const newCount = newData.countAdded || 0;
      
      if (newCount <= oldCount) return;
      
      const countIncrease = newCount - oldCount;
      
      // Get current total
      const configDoc = await admin.firestore().collection('config').doc('main').get();
      const totalCount = configDoc.data()?.totalThankyouCount || 0;
      
      const emailHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #D4F8E8 0%, #E8D4F8 100%); padding: 20px; }
              .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .title { font-size: 28px; color: #FFB5D8; font-weight: bold; margin: 0; }
              .content { background: #FFF8F0; padding: 20px; border-radius: 15px; margin: 20px 0; }
              .entry-title { font-size: 18px; color: #2D2D2D; font-weight: 600; }
              .stats { display: flex; justify-content: space-around; margin: 25px 0; text-align: center; }
              .stat-box { background: linear-gradient(135deg, #FFB5D8 0%, #D4F8E8 100%); padding: 15px; border-radius: 10px; flex: 1; margin: 0 10px; }
              .stat-number { font-size: 32px; font-weight: bold; color: white; }
              .stat-label { font-size: 12px; color: #2D2D2D; margin-top: 5px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 class="title">📈 Thank You Count Updated!</h1>
              </div>
              
              <div class="content">
                <h2 class="entry-title">${escapeHtml(newData.title)}</h2>
                <p>The thank you count has been increased! 🎉</p>
              </div>
              
              <div class="stats">
                <div class="stat-box">
                  <div class="stat-number">+${countIncrease}</div>
                  <div class="stat-label">Added</div>
                </div>
                <div class="stat-box">
                  <div class="stat-number">${totalCount}</div>
                  <div class="stat-label">New Total</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      
      await transporter.sendMail({
        from: ADMIN_EMAIL,
        to: `${ADMIN_EMAIL}, ${FRIEND_EMAIL}`,
        subject: `📈 Thank You Count Updated: ${newData.title}`,
        html: emailHTML,
      });
      
      console.log('Update email sent for entry:', context.params.docId);
      
    } catch (error) {
      console.error('Error sending update email:', error);
    }
  });

/**
 * Cloud Function: Triggers when paid entry is created
 */
exports.sendPaidEmail = functions.firestore
  .document('paid_entries/{docId}')
  .onCreate(async (snap, context) => {
    try {
      const data = snap.data();
      
      const paidDate = data.date?.toDate?.() || new Date();
      const formattedDate = paidDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      // Get totals
      const configDoc = await admin.firestore().collection('config').doc('main').get();
      const totalCount = configDoc.data()?.totalThankyouCount || 0;
      
      // Calculate remaining
      const paidSnapshot = await admin.firestore().collection('paid_entries').get();
      let totalPaid = 0;
      paidSnapshot.forEach(doc => {
        totalPaid += doc.data().countDeducted || 0;
      });
      
      const remaining = totalCount - totalPaid;
      
      const emailHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #FFE8D6 0%, #FFB5D8 100%); padding: 20px; }
              .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; }
              .title { font-size: 28px; color: #2D2D2D; text-align: center; }
              .content { background: #FFF8F0; padding: 20px; border-radius: 15px; margin: 20px 0; }
              .stats { display: flex; justify-content: space-around; margin: 20px 0; text-align: center; }
              .stat-box { background: #FFB5D8; color: white; padding: 15px; border-radius: 10px; flex: 1; margin: 0 10px; }
              .stat-number { font-size: 28px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="title">💝 Thank You Paid</h1>
              
              <div class="content">
                <h2>${escapeHtml(data.title)}</h2>
                <p>📅 ${formattedDate}</p>
              </div>
              
              <div class="stats">
                <div class="stat-box">
                  <div class="stat-number">-${data.countDeducted}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-number">${remaining}</div>
                  Remaining
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      
      await transporter.sendMail({
        from: ADMIN_EMAIL,
        to: `${ADMIN_EMAIL}, ${FRIEND_EMAIL}`,
        subject: `💝 Thank You Paid: ${data.title}`,
        html: emailHTML,
      });
      
      console.log('Paid email sent:', context.params.docId);
      
    } catch (error) {
      console.error('Error sending paid email:', error);
    }
  });

/**
 * Helper function to escape HTML
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
