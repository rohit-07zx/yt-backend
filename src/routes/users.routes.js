import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOut,
  refreshAccessToken,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/verifyAuth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(verifyJwt, loginUser);
// verify jwt
router.route("/logout").post(verifyJwt, logOut);

router.route("/refresh-token").post(refreshAccessToken);

export default router;
