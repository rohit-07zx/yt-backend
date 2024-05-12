import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  passwordSalts,
} from "@crispengari/regex-validator";
import { ValidationException } from "../utils/validation.exception.js";
import { uploadOnCloudinary } from "./../utils/cloudinary.js";
import { errorHandler } from "../constant/global.error.handler.js";

async function uploadImages(avatarLocalPath, coverImageLocalPath) {
  if (!avatarLocalPath) {
    throw new ValidationException(400);
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ValidationException(400, errorHandler.user.emptyAvatar);
  }

  return { avatar, coverImage };
}

export const validateUserdetails = async (req) => {
  const { fullName, email, username, password } = req.body;
  const hashtype = "M8L1U1D1S1";

  if (!isValidEmail(email)) {
    throw new ValidationException(400, errorHandler.user.invalidEmail);
  } else if (!isValidPassword(username, passwordSalts.M8L1D1)) {
    throw new ValidationException(400, errorHandler.user.invalidUsername);
  } else if (!isValidPassword(password, passwordSalts.M8L1D1)) {
    throw new ValidationException(400, errorHandler.user.invalidPassword);
  }

  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  } else {
    throw new ValidationException(400, "Invalid avatar!");
  }
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  return await uploadImages(avatarLocalPath, coverImageLocalPath);
};
