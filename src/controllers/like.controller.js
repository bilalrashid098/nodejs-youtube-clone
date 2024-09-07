import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandle.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video id is missing");
  }

  try {
    await Like.create({
      video: videoId,
      likeBy: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Video liked successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in like controller"
    );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.body;

  if (!commentId) {
    throw new ApiError(400, "Comment id is missing");
  }

  try {
    await Like.create({
      comment: commentId,
      likeBy: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Comment liked successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in like controller"
    );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is missing");
  }

  try {
    await Like.create({
      tweet: tweetId,
      likeBy: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet liked successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in like controller"
    );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const { page = 1, limit = 10 } = req.query;
  const { _id } = req.user;

  if (!_id) {
    throw new ApiError(400, "User id is missing");
  }

  const options = {
    page,
    limit,
    sort: {
      createdAt: -1,
    },
  };

  try {
    const likedVideos = await Like.aggregatePaginate(
      [
        {
          $match: {
            likeBy: new mongoose.Types.ObjectId(_id),
            video: { $ne: null },
          },
        },
        {
          $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "video",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  title: 1,
                  description: 1,
                  thumbnail: 1,
                  views: 1,
                  owner: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$video",
        },
      ],
      options
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "User liked videos fetch successfully",
          likedVideos
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in like controller"
    );
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
