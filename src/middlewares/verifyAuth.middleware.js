import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";
import { ValidationException } from "../utils/validation.exception.js";
import { validateUserdetails } from "../controllers/user.validation.js";
import { errorHandler } from "../constant/global.error.handler.js";
import { constant } from "../constant/global.constant.js";

const verifyJwt = asyncHandler(async (req, _, next) => {
  //try {
  const token =
    req.cookies?.accessToken ||
    req?.header("Authrization")?.replace("Bearer ", "");

  if (!token) {
    throw new ValidationException(400, "invalid auth token!");
  }

  const decodeToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodeToken._id).select(
    constant.user_private_credentials
  );
  if (!user) {
    throw new ValidationException(401, " invalid access token");
  }

  req.user = user;
  next();
  // } catch (error) {
  //   throw new ValidationException(401, error?.message || "Invalid acess token");
  // }
});

export { verifyJwt };
