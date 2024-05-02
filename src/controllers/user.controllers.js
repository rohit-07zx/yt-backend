import { asyncHandler } from "./../utils/asyncHandler.js";
import { ValidationException } from "../utils/validation.exception.js";
import { User } from "./../models/users.model.js";
import ApiResponse from "../utils/api.response.js";
import { errorHandler } from "../constant/global.error.js";
import { messageHandler } from "../constant/message.handler.js";
import { validateUserdetails } from "./user.validation.js";

const registerUser = asyncHandler(async (req, res) => {
  const { avatar, coverImage } = await validateUserdetails(req);
  const { fullName, email, username, password } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ValidationException(409, errorHandler.user.existedUser);
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ValidationException(500, errorHandler.server.internalError);
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdUser,
        messageHandler.user.sucessfullyRegistered
      )
    );
});

export { registerUser };
