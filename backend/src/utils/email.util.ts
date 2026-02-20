import nodemailer from "nodemailer";
import { getVerificationEmailTemplate } from "./templates/auth.templates";

export const sendVerificationEmail = async (email: string, token: string) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_PORT === "465",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Verify your Wareflow Account",
        html: getVerificationEmailTemplate(verificationUrl)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to: ${email}`);
        return true;
    } catch (error) {
        console.error("Error sending verification email:", error);

        console.log("-----------------------------------------");
        console.log(`FALLBACK Verification Link: ${verificationUrl}`);
        console.log("-----------------------------------------");
        return false;
    }
};
