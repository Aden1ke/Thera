import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router(); 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,    // Your email address (e.g., from an app-specific password for Gmail)
    pass: process.env.EMAIL_PASS    // Your email password or app-specific password
  }
});

router.post('/emergency-contact', async (req, res) => {
  const { userProfile, emotionalState, timestamp } = req.body;

  // Basic validation: ensure userProfile and emergency contact email exist
  if (!userProfile || !userProfile.emergencyContact || !userProfile.emergencyContact.email) {
    return res.status(400).json({ message: 'Emergency contact email is missing in the request.' });
  }

  const userFullName = userProfile.name || 'Your User';
  const emergencyContactName = userProfile.emergencyContact.name || 'Emergency Contact';
  const emergencyContactEmail = userProfile.emergencyContact.email;
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email address
      to: emergencyContactEmail, // Recipient (emergency contact's email)
      subject: `URGENT: ${userFullName} is in Distress - Please Check In`,
      html: `
        <p>Dear ${emergencyContactName},</p>
        <p>This is an automated alert from Thera. Your designated contact, <strong>${userFullName}</strong>, is currently experiencing a critical level of distress (Distress: ${emotionalState.distress}%).</p>
        <p>This notification was triggered automatically at ${new Date(timestamp).toLocaleString()}.</p>
        <p>We recommend reaching out to ${userFullName} as soon as possible. Their registered phone number is: <strong>${userProfile.phone || 'N/A'}</strong>.</p>
        <p>Please provide support and ensure their well-being.</p>
        <p>Sincerely,<br>The Thera Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Emergency email sent successfully to:', emergencyContactEmail);

    // Respond to the frontend that the email was sent
    res.status(200).json({ message: 'Emergency email notification sent successfully.' });

  } catch (error) {
    console.error('Error sending emergency email:', error);
    // Respond with an error message if email sending fails
    res.status(500).json({ error: 'Failed to send emergency email notification.', details: error.message });
  }
});

//module.exports = router;
export default router;
