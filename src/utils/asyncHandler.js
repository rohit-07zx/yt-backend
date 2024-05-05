import ApiResponse from "./api.response.js";

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      res.status(500).json(new ApiResponse(500, null, err.message));
      next(err);
    });
  };
};

export { asyncHandler };
