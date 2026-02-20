import nodemailer from "nodemailer";
import { getVerificationEmailTemplate } from "./templates/auth.templates";

const createTransporter = () => nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendVerificationEmail = async (email: string, token: string) => {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Verify your Wareflow Account",
        html: getVerificationEmailTemplate(verificationUrl)
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch {
        return false;
    }
};

export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
    const transporter = createTransporter();
    try {
        await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
        return true;
    } catch {
        return false;
    }
};
