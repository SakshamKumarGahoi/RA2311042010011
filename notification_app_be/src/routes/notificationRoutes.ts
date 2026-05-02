import { Router, type Request, type Response, type NextFunction } from 'express';
import { Log } from '../utils/logger.js';
import { notificationController } from '../controller/notificationController.js';

const router = Router();

router.use(async (req: Request, res: Response, next: NextFunction) => {
    await Log(
        "backend",
        "info",
        "route",
        `${req.method} ${req.originalUrl}`
    );
    next();
});

router.post("/", notificationController.create);
router.get("/", notificationController.list);
router.patch("/:id/status", notificationController.patchStatus);
router.delete("/:id", notificationController.remove);

export default router;
