import { Router } from "express";
import {
    submitPODController,
    getPODController,
    raisePODDisputeController,
    advanceDisputeController
} from "../controllers/proofOfDelivery.controller";

const router = Router();

router.post("/", submitPODController);
router.get("/:shipmentId", getPODController);
router.post("/:shipmentId/dispute", raisePODDisputeController);
router.patch("/:shipmentId/dispute/advance", advanceDisputeController);

export default router;
