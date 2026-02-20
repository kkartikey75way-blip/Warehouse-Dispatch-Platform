import { Request, Response } from "express";
import {
    createScheduledReportService,
    listScheduledReportsService,
    deleteScheduledReportService,
    runReportNowService,
    verifyReportDownloadLink
} from "../services/scheduler.service";
import { analyzeCausalWaterfall } from "../services/analytics.service";
import { AppError } from "../utils/appError";

export const listSchedulesController = async (_req: Request, res: Response): Promise<void> => {
    const schedules = listScheduledReportsService();
    res.status(200).json({ success: true, data: schedules });
};

export const createScheduleController = async (req: Request, res: Response): Promise<void> => {
    const { name, type, format, cronExpression, timezone, recipientEmails } = req.body;

    if (!name || !type || !cronExpression || !timezone || !recipientEmails?.length) {
        throw new AppError("name, type, cronExpression, timezone, recipientEmails are required", 400);
    }

    const validTypes = ["dispatch_manifest", "delivery_report"];
    if (!validTypes.includes(type)) {
        throw new AppError(`type must be one of: ${validTypes.join(", ")}`, 400);
    }

    const schedule = createScheduledReportService({
        name,
        type,
        format: format || "pdf",
        cronExpression,
        timezone,
        recipientEmails,
        isActive: true
    });

    res.status(201).json({ success: true, data: schedule });
};

export const deleteScheduleController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const deleted = deleteScheduledReportService(id);

    if (!deleted) throw new AppError("Scheduled report not found", 404);
    res.status(200).json({ success: true, message: "Schedule deleted" });
};

export const runNowController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    await runReportNowService(id);
    res.status(200).json({ success: true, message: "Report triggered and emailed" });
};

export const validateDownloadLinkController = async (req: Request, res: Response): Promise<void> => {
    const { id, file, exp, sig } = req.query as { id: string; file: string; exp: string; sig: string; };

    const isValid = verifyReportDownloadLink(id, file, Number(exp), sig);

    if (!isValid) {
        res.status(403).json({ success: false, message: "Invalid or expired download link" });
        return;
    }

    res.status(200).json({
        success: true,
        message: "Link is valid",
        filename: file
    });
};

export const causalAnalysisController = async (req: Request, res: Response): Promise<void> => {
    const { windowHours } = req.query as { windowHours?: string };
    const analysis = await analyzeCausalWaterfall(windowHours ? Number(windowHours) : 24);
    res.status(200).json({ success: true, data: analysis });
};
