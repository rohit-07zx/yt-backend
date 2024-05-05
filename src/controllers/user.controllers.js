import { asyncHandler } from "./../utils/asyncHandler.js";
import { ValidationException } from "../utils/validation.exception.js";
import { User } from "./../models/users.model.js";
import ApiResponse from "../utils/api.response.js";
import { errorHandler } from "../constant/global.error.handler.js";
import { messageHandler } from "../constant/message.handler.js";
import { validateUserdetails } from "./user.validation.js";
import { constant } from "../constant/global.constant.js";
import jwt from "jsonwebtoken";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ValidationException(500, errorHandler.server.internalError);
  }
};

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
    constant.user_private_credentials
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

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ValidationException(
      400,
      errorHandler.user.invalidUsernameOrEmail
    );
  }

  const user = await User.findOne({
    $or: [{ username, email }],
  });

  if (!user) {
    throw new validateUserdetails(404, errorHandler.user.userNotExist);
  }
  const ispaswordValid = await user.isPasswordCorrect(password);
  if (!ispaswordValid) {
    throw new ValidationException(401, errorHandler.user.invalidPassword);
  }
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    constant.user_private_credentials
  );

  return res
    .status(200)
    .cookie(constant.accessToken, accessToken, options)
    .cookie(constant.refreshToken, refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser.accessToken,
          refreshToken,
        },
        messageHandler.user.userLoggedIn
      )
    );
});

const logOut = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .clearCookie(constant.accessToken)
    .clearCookie(constant.refreshToken)
    .json(new ApiResponse(200, {}, messageHandler.user.userLoggedOut));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookie.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ValidationException(401, "unauthorized request");
    }
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedRefreshToken._id);

    if (!user) {
      new ValidationException(401, "invalid refresh token!");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ValidationException(401, "refresh token is expired or used!");
    }
    const { accessToken, refreshToken } = generateAccessTokenAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie(constant.accessToken, accessToken, options)
      .cookie(constant.refreshToken, refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "access token refreshed!"
        )
      );
  } catch (error) {
    throw new ValidationException(
      401,
      error?.message || "invalid refresh token"
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ValidationException(400, "invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed Sucessfully!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched Successfully"));
});

export {
  registerUser,
  loginUser,
  logOut,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
};
