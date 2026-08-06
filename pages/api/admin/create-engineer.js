import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, fullName, phoneNumber } = req.body;

    // 1. Create Auth User in Supabase
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // 2. Insert into Profiles table
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authUser.user.id,
      full_name: fullName,
      email: email,
      phone_number: phoneNumber,
      role: 'ENGINEER',
      current_status: 'AVAILABLE'
    });

    if (profileError) return res.status(400).json({ error: profileError.message });

    // 3. Configure Email Transporter (Using Gmail SMTP or custom SMTP)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your sender email
        pass: process.env.EMAIL_PASS, // Your App Password
      },
    });

    // 4. Send Credentials Email
    const mailOptions = {
      from: `"ATM Servicing Operations" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to the Team - Your Field Engineer Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Welcome to the ATM Dispatch Team, ${fullName}!</h2>
          <p>Your Field Engineer account has been officially created. Here are your permanent login credentials:</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Portal URL:</strong> <a href="http://localhost:3000/engineer/login">Engineer Login Portal</a></p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Permanent Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
          </div>
          
          <p>Please log in to check your active ticket assignments.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
          <p style="font-size: 12px; color: #666;">This is an automated dispatch message. Do not reply to this email.</p>
        </div>
      `,
    };

    // Attempt to send the email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    }

    return res.status(200).json({ success: true, user: authUser.user, emailSent: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}