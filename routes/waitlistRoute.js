import e from "express";
import { joinWaitlist } from "../controllers/WaitlistContr.js";

const router = e.Router();

router.post("/join", joinWaitlist)

export default router;