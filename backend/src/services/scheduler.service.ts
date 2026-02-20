import crypto from "crypto";
import { sendEmail } from "../utils/email.util";
import {
    generateDispatchManifestCSV,
    generateDeliveryReportCSV,
    generateDispatchManifestPDF,
    generateDeliveryReportPDF
} from "./export.service";
import { getReportReadyEmailTemplate } from "../utils/templates/report.templates";
import { AppError } from "../utils/appError";

export interface ScheduledReport {
    id: string;
    name: string;
    type: "dispatch_manifest" | "delivery_report";
    format: "csv" | "pdf";
    cronExpression: string;
    timezone: string;
    recipientEmails: string[];
    isActive: boolean;
    lastRunAt?: Date;
    nextRunAt?: Date;
}

const scheduleRegistry: Map<string, ScheduledReport> = new Map();
const timerRegistry: Map<string, ReturnType<typeof setTimeout>> = new Map();

const getNextRunTime = (cronExpression: string, timezone: string): Date => {
    try {
        const parts = cronExpression.trim().split(/\s+/);
        if (parts.length !== 5) {
            const next = new Date();
            next.setDate(next.getDate() + 1);
            next.setHours(0, 0, 0, 0);
            return next;
        }
        const [minuteStr, hourStr] = parts;
        const minute = minuteStr === "*" ? 0 : parseInt(minuteStr ?? "0", 10);
        const hour = hourStr === "*" ? 0 : parseInt(hourStr ?? "0", 10);
        const nowInTz = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
        const next = new Date(nowInTz);
        next.setHours(hour, minute, 0, 0);
        if (next <= nowInTz) next.setDate(next.getDate() + 1);
        return next;
    } catch {
        return new Date(Date.now() + 60 * 60 * 1000);
    }
};

const generateSignedLink = (reportId: string, filename: string): string => {
    const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    const secret = process.env.JWT_ACCESS_SECRET || "report-secret";
    const payload = `${reportId}:${filename}:${expiry}`;
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
    return `${baseUrl}/api/reports/download?id=${reportId}&file=${encodeURIComponent(filename)}&exp=${expiry}&sig=${signature}`;
};

const runReport = async (schedule: ScheduledReport): Promise<void> => {
    try {
        let content: string | Buffer = "";
        let filename = "";
        const dateStr = new Date().toISOString().split("T")[0];

        if (schedule.type === "dispatch_manifest") {
            if (schedule.format === "pdf") {
                content = await generateDispatchManifestPDF();
                filename = `dispatch-manifest-${dateStr}.pdf`;
            } else {
                content = await generateDispatchManifestCSV();
                filename = `dispatch-manifest-${dateStr}.csv`;
            }
        } else {
            if (schedule.format === "pdf") {
                content = await generateDeliveryReportPDF();
                filename = `delivery-report-${dateStr}.pdf`;
            } else {
                content = await generateDeliveryReportCSV();
                filename = `delivery-report-${dateStr}.csv`;
            }
        }

        if (!content) return;

        const reportId = crypto.randomUUID();
        const downloadLink = generateSignedLink(reportId, filename);
        const generatedAt = new Date().toLocaleString("en-US", { timeZone: schedule.timezone });

        const html = getReportReadyEmailTemplate(
            schedule.name,
            schedule.type,
            schedule.format,
            generatedAt,
            downloadLink
        );

        for (const email of schedule.recipientEmails) {
            await sendEmail(email, `Wareflow Report: ${schedule.name}`, html);
        }

        schedule.lastRunAt = new Date();
        schedule.nextRunAt = getNextRunTime(schedule.cronExpression, schedule.timezone);
    } catch (error) {
        console.error(`[Scheduler] Error:`, error);
    }
};

const scheduleNext = (schedule: ScheduledReport): void => {
    const existing = timerRegistry.get(schedule.id);
    if (existing) clearTimeout(existing);
    if (!schedule.isActive) return;

    const nextRun = getNextRunTime(schedule.cronExpression, schedule.timezone);
    schedule.nextRunAt = nextRun;

    const delay = Math.max(0, nextRun.getTime() - Date.now());
    const timer = setTimeout(async () => {
        await runReport(schedule);
        scheduleNext(schedule);
    }, delay);

    timerRegistry.set(schedule.id, timer);
};

export const createScheduledReportService = (config: Omit<ScheduledReport, "id" | "lastRunAt" | "nextRunAt">): ScheduledReport => {
    const id = crypto.randomUUID();
    const schedule: ScheduledReport = {
        ...config,
        id,
        nextRunAt: getNextRunTime(config.cronExpression, config.timezone)
    };

    scheduleRegistry.set(id, schedule);
    scheduleNext(schedule);
    return schedule;
};

export const listScheduledReportsService = (): ScheduledReport[] => {
    return Array.from(scheduleRegistry.values());
};

export const deleteScheduledReportService = (id: string): boolean => {
    const existing = timerRegistry.get(id);
    if (existing) {
        clearTimeout(existing);
        timerRegistry.delete(id);
    }
    return scheduleRegistry.delete(id);
};

export const runReportNowService = async (id: string): Promise<void> => {
    const schedule = scheduleRegistry.get(id);
    if (!schedule) throw new AppError(`Scheduled report ${id} not found`, 404);
    await runReport(schedule);
};

export const verifyReportDownloadLink = (reportId: string, filename: string, expiry: number, sig: string): boolean => {
    const secret = process.env.JWT_ACCESS_SECRET || "report-secret";
    const payload = `${reportId}:${filename}:${expiry}`;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const now = Math.floor(Date.now() / 1000);

    return sig === expected && now < expiry;
};
