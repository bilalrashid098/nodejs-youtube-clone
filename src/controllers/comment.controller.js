import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandle.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId, page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video id is missing");
  }

  const options = {
    page,
    limit,
    sort: {
      createdAt: -1,
    },
  };

  try {
    const comments = await Comment.aggregatePaginate(
      [
        {
          $match: {
            video: new mongoose.Types.ObjectId(videoId),
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
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "comment",
            as: "likes",
          },
        },
        {
          $addFields: {
            likes: { $size: "$likes" },
          },
        },
      ],
      options
    );

    const data = {
      comments: comments.docs,
      total: comments.totalDocs,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Comments listing fetched successfully", data)
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in comment controller"
    );
  }
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { content, videoId } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video id is missing");
  }

  if (!content) {
    throw new ApiError(400, "Comment content is missing");
  }

  try {
    const comment = await Comment.create({
      content,
      video: videoId,
      owner: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Comment created successfully", comment));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in comment controller"
    );
  }
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { content, commentId } = req.body;

  if (!commentId) {
    throw new ApiError(400, "Comment id is missing");
  }

  if (!content) {
    throw new ApiError(400, "Comment content is missing");
  }

  try {
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content,
        },
      },
      {
        new: 1,
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Comment updated successfully", comment));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in comment controller"
    );
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.query;

  if (!commentId) {
    throw new ApiError(400, "Comment id is missing");
  }

  try {
    await Comment.findByIdAndDelete(commentId);
    return res
      .status(200)
      .json(new ApiResponse(200, "Comment deleted successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in comment controller"
    );
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
