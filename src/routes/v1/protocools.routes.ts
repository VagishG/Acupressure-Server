import { Router } from "express";

import { verifyJwt } from "../../middleware/auth";
import {searchString ,getProtocolImage} from "../../controllers/protocols.controller";
const router = Router();

router.route("/searchString").post(verifyJwt,searchString);
router.route("/getProtocolImage").post(verifyJwt,getProtocolImage);
export default router;
