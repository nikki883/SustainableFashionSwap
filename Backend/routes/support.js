import express from "express";
import SupportMessage from "../models/SupportMessage.js";
import nodemailer from "nodemailer";

const router = express.Router();

// POST /api/support
router.post("/", async (req, res) => {
    console.log("Received Support Message:", req.body); 
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    const newMessage = new SupportMessage({ name, email, message });
    await newMessage.save();

    // Optional: Send email to your support inbox
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SUPPORT_EMAIL,
        pass: process.env.SUPPORT_EMAIL_PASSWORD, // use App Password if 2FA
      },
    });

    await transporter.sendMail({
        from: `"Fashion Swap Support" <${process.env.SUPPORT_EMAIL}>`,
        to: process.env.SUPPORT_EMAIL,
        replyTo: email, 
        subject: `New Support Request from ${name}`,
        html: `
          <h3>Support Message</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong><br/>${message}</p>
        `,
      });
      
      await transporter.sendMail({
        from: `"Fashion Swap Support" <${process.env.SUPPORT_EMAIL}>`,
        to: email, 
        subject: "We’ve received your support request",
        html: `
          <p>Hi ${name},</p>
        <p>Thanks for contacting <strong>Fashion Swap Support</strong>.</p>
        <p>We’ve received your message and our team will get back to you shortly.</p>
        <hr />
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
        <br/>
        <p>Regards,<br/>Fashion Swap Team</p>
      `,
      });
      

    res.status(200).json({ message: "Support request sent successfully." });
  } catch (err) {
    console.error("Support Error:", err);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

export default router;
