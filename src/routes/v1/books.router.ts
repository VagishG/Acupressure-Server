import { Router } from "express";
import { create_account, isValidUser, Login, logout } from "../../controllers/auth.controller";
import { verifyJwt } from "../../middleware/auth";
import { get_book, get_books_list } from "../../controllers/books.controller";
const router=Router();

router.route("/get_book_list").get(verifyJwt,get_books_list);
router.route("/get_book").post(verifyJwt,get_book);

// router.route("/logout").get(verifyJwt,logout);
// router.route("/is_valid_user").get(verifyJwt,isValidUser);


export default router;