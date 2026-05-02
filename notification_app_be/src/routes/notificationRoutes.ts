import {router} from '../router';
import { Log } from 'logging_middleware';
import { NotificationController } from '../controllers/notification_controller';

const router = router();
router.use(async (req, res, next) => {
    await Log(
        "backend",
        "frontend",
        "route",
        `${req.method} ${req.originalUrl}`

    );
    next();
});

router.post("/", notificationsController.create);
router.get("/", notificationsController.list);
router.patch("/:id/status", notificationsController.patchStatus);
router.delete("/:id", notificationsController.remove);

export default router;