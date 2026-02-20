export const getVerificationEmailTemplate = (verificationUrl: string) => {
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 20px;">Welcome to Wareflow</h1>
            <p style="color: #64748b; line-height: 1.6;">Thank you for registering. Please click the button below to verify your email address and activate your account.</p>
            <div style="margin-top: 30px; margin-bottom: 30px;">
                <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-top: 20px;">
            <p style="color: #94a3b8; font-size: 10px; text-align: center;">Wareflow Logistics Platform v2.0</p>
        </div>
    `;
};
