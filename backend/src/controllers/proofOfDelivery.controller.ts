import { Request, Response } from "express";
import {
    submitPODService,
    raisePODDisputeService,
    advanceDisputeWorkflowService,
    getPODService
} from "../services/proofOfDelivery.service";
import { DisputeStatus } from "../models/proofOfDelivery.model";
import { AppError } from "../utils/appError";

export const submitPODController = async (req: Request, res: Response): Promise<void> => {
    const {
        shipmentId, driverId, recipientName, signatureUrl, photoUrl,
        latitude, longitude, accuracy, notes
    } = req.body;

    if (!shipmentId || !driverId || latitude === undefined || longitude === undefined) {
        throw new AppError("shipmentId, driverId, latitude, longitude are required", 400);
    }

    const podPayload = {
        shipmentId, driverId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        ...(recipientName !== undefined && { recipientName }),
        ...(signatureUrl !== undefined && { signatureUrl }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(accuracy !== undefined && { accuracy: Number(accuracy) }),
        ...(notes !== undefined && { notes })
    };

    const pod = await submitPODService(podPayload);

    res.status(201).json({ success: true, data: pod });
};

export const getPODController = async (req: Request, res: Response): Promise<void> => {
    const { shipmentId } = req.params as { shipmentId: string };
    if (!shipmentId) throw new AppError("shipmentId is required", 400);

    const pod = await getPODService(shipmentId);
    res.status(200).json({ success: true, data: pod });
};

export const raisePODDisputeController = async (req: Request, res: Response): Promise<void> => {
    const { shipmentId } = req.params as { shipmentId: string };
    const { raisedBy, reason } = req.body;

    if (!shipmentId || !raisedBy || !reason) {
        throw new AppError("shipmentId, raisedBy, reason are required", 400);
    }

    const pod = await raisePODDisputeService(shipmentId, raisedBy, reason);
    res.status(200).json({ success: true, data: pod });
};

export const advanceDisputeController = async (req: Request, res: Response): Promise<void> => {
    const { shipmentId } = req.params as { shipmentId: string };
    const { action, performedBy, resolution, notes } = req.body;

    if (!shipmentId || !action || !performedBy) {
        throw new AppError("shipmentId, action, performedBy are required", 400);
    }

    if (resolution && !Object.values(DisputeStatus).includes(resolution)) {
        throw new AppError("Invalid dispute resolution status", 400);
    }

    const pod = await advanceDisputeWorkflowService(
        shipmentId, action, performedBy,
        resolution as DisputeStatus | undefined,
        notes
    );

    res.status(200).json({ success: true, data: pod });
};
