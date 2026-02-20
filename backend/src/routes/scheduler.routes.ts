import { Router } from "express";
import {
    listSchedulesController,
    createScheduleController,
    deleteScheduleController,
    runNowController,
    validateDownloadLinkController,
    causalAnalysisController
} from "../controllers/scheduler.controller";

const router = Router();

router.get("/schedules", listSchedulesController);
router.post("/schedules", createScheduleController);
router.delete("/schedules/:id", deleteScheduleController);
router.post("/schedules/:id/run", runNowController);
router.get("/download", validateDownloadLinkController);
router.get("/causal-analysis", causalAnalysisController);

export default router;
