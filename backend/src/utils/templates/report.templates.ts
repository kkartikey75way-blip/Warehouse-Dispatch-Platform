export const getReportReadyEmailTemplate = (
    reportName: string,
    reportType: string,
    reportFormat: string,
    generatedAt: string,
    downloadLink: string
): string => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 12px; background: #fff;">
        <div style="margin-bottom: 30px;">
            <span style="background: #6366f1; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;">System Auto-Gen</span>
        </div>
        <h2 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-top: 0; letter-spacing: -0.025em;">📦 Your Report is Ready</h2>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Your scheduled report <strong>${reportName}</strong> has been successfully generated and is now available for download.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <table style="width: 100%; font-size: 12px; color: #475569;">
                <tr>
                    <td style="padding-bottom: 8px; font-weight: 900; text-transform: uppercase; color: #94a3b8; width: 120px;">Report Type</td>
                    <td style="padding-bottom: 8px; font-weight: 700; color: #1e293b;">${reportType.replace("_", " ").toUpperCase()}</td>
                </tr>
                <tr>
                    <td style="padding-bottom: 8px; font-weight: 900; text-transform: uppercase; color: #94a3b8;">Format</td>
                    <td style="padding-bottom: 8px; font-weight: 700; color: #1e293b;">${reportFormat.toUpperCase()}</td>
                </tr>
                <tr>
                    <td style="font-weight: 900; text-transform: uppercase; color: #94a3b8;">Generated</td>
                    <td style="font-weight: 700; color: #1e293b;">${generatedAt}</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin-top: 32px;">
            <a href="${downloadLink}" style="display: inline-block; background: #6366f1; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);">⬇️ Download Report</a>
            <p style="color: #94a3b8; font-size: 10px; margin-top: 16px; font-weight: 600; text-transform: uppercase;">Link expires in 24 hours</p>
        </div>
        
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="color: #cbd5e1; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">Wareflow Logistics Platform</p>
        </div>
    </div>
`;
