// services/emailService.js - Email service (if not already exists)
import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS 
            }
        });
    }

    async sendEmail({ to, subject, html, text }) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, '') 
            };

            const result = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}

export default new EmailService();