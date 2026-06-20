// services/email/emailService.ts
import nodemailer from "nodemailer";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@agent-connect.sn",
        to,
        subject,
        html,
      });
      return info;
    } catch (error) {
      console.error("Erreur envoi email:", error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <h1>Bienvenue sur Agent Connect</h1>
      <p>Bonjour ${name},</p>
      <p>Votre compte a été créé avec succès.</p>
      <p>Connectez-vous pour commencer à utiliser la plateforme.</p>
      <a href="${process.env.NEXTAUTH_URL}/auth/login">Se connecter</a>
    `;
    return this.sendEmail(to, "Bienvenue sur Agent Connect", html);
  }
}
