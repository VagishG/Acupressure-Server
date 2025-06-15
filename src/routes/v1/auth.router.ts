import { Router } from "express";
import { create_account, isValidUser, Login, logout } from "../../controllers/auth.controller";
import { verifyJwt } from "../../middleware/auth";
const router=Router();

router.route("/login").post(Login);
router.route("/create_account").post(create_account);
router.route("/logout").get(verifyJwt,logout);
router.route("/is_valid_user").get(verifyJwt,isValidUser);


export default router;