import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandle.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is missing");
  }

  try {
    const tweet = await Tweet.create({
      owner: req.user._id,
      content,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet created successfully", tweet));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in tweet controller"
    );
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId, page = 1, limit = 10 } = req.query;

  if (!userId) {
    throw new ApiError(400, "User id is missing");
  }

  const options = {
    page,
    limit,
    sort: {
      createdAt: -1
    } 
  };

  try {
    const tweets = await Tweet.aggregatePaginate(
      [
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  fullname: 1,
                  avatar: 1,
                  cover: 1,
                  email: 1,
                },
              },
              
            ],
          },
        },
        {
          $addFields: {
            owner: {
              $first: "$owner",
            },
          },
        },
       
      ],
      options
    );

    const data = {
      tweets: tweets.docs,
      total: tweets.totalDocs
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet listing fetch successfully", data));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in tweet controller"
    );
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId, content } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is missing");
  }

  if (!content) {
    throw new ApiError(400, "Content is missing");
  }

  try {
    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        content,
      },
      {
        new: 1,
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet updated successfully", tweet));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in tweet controller"
    );
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.query;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is missing");
  }

  try {
    await Tweet.findByIdAndDelete(tweetId);
    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet deleted successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in tweet controller"
    );
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
