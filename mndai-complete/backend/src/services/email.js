const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

class EmailService {
  static async sendBookingConfirmation({ email, name, service, time, bookingId }) {
    try {
      const msg = {
        to: email,
        from: process.env.FROM_EMAIL || 'noreply@mndai.com',
        subject: `Booking Confirmation - ${service}`,
        html: `
          <h2>Your booking is confirmed!</h2>
          <p>Hi ${name},</p>
          <p>We're looking forward to seeing you!</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Time:</strong> ${new Date(time).toLocaleString()}</p>
          <p><a href="${process.env.FRONTEND_URL}/bookings/${bookingId}">View Booking</a></p>
        `
      };

      if (process.env.SENDGRID_API_KEY) {
        await sgMail.send(msg);
      } else {
        console.log('SendGrid not configured, skipping email');
      }

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  static async sendBookingReminder({ email, name, service, time }) {
    try {
      const msg = {
        to: email,
        from: process.env.FROM_EMAIL || 'noreply@mndai.com',
        subject: `Reminder: ${service} appointment tomorrow`,
        html: `
          <h2>Your appointment is tomorrow!</h2>
          <p>Hi ${name},</p>
          <p>Don't forget your ${service} appointment tomorrow at ${new Date(time).toLocaleTimeString()}.</p>
        `
      };

      if (process.env.SENDGRID_API_KEY) {
        await sgMail.send(msg);
      }

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  static async sendCampaign({ email, name, subject, content }) {
    try {
      const msg = {
        to: email,
        from: process.env.FROM_EMAIL || 'noreply@mndai.com',
        subject,
        html: content
      };

      if (process.env.SENDGRID_API_KEY) {
        await sgMail.send(msg);
      }

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }
}

module.exports = EmailService;
