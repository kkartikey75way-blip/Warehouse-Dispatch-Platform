import { Request, Response } from "express";
import {
    generateDispatchManifestCSV,
    generateDeliveryReportCSV,
    generateDispatchManifestPDF,
    generateDeliveryReportPDF
} from "../services/export.service";

export const exportDispatchManifestController = async (_req: Request, res: Response): Promise<void> => {
    const csv = await generateDispatchManifestCSV();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=dispatch-manifest.csv");
    res.status(200).send(csv);
};

export const exportDispatchManifestPDFController = async (_req: Request, res: Response): Promise<void> => {
    const pdf = await generateDispatchManifestPDF();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=dispatch-manifest.pdf");
    res.status(200).send(pdf);
};

export const exportDeliveryReportController = async (_req: Request, res: Response): Promise<void> => {
    const csv = await generateDeliveryReportCSV();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=delivery-report.csv");
    res.status(200).send(csv);
};

export const exportDeliveryReportPDFController = async (_req: Request, res: Response): Promise<void> => {
    const pdf = await generateDeliveryReportPDF();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=delivery-report.pdf");
    res.status(200).send(pdf);
};
