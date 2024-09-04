import mongoose, { isValidObjectId, Mongoose } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { uploadMedia } from "../utils/cloudinary.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandle.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  console.log(page, limit, query, userId);
  //TODO: get all videos based on query, sort, pagination

  if (!userId) {
    throw new ApiError(400, "User id is missing");
  }

  const options = {
    page,
    limit,
    sort: {},
  };

  if (sortBy && sortType) {
    options.sort[sortBy] = Number(sortType);
  }

  const video = await Video.aggregatePaginate(
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

  if (!video) {
    res.status(400).json(new ApiError(400, "No video"));
  }

  const data = {
    videos: video.docs,
    total: video.totalDocs,
  };

  res.status(200).json(new ApiResponse(200, "Video listing", data));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  if (!description) {
    throw new ApiError(400, "Description is required");
  }

  try {
    const videoLocalPath = req?.files?.video?.[0]?.path;
    const thumbnailLocalPath = req?.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
      throw new ApiError(400, "Video is required");
    }

    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Thumbnail is required");
    }

    const video = await uploadMedia(videoLocalPath);
    const thumbnail = await uploadMedia(thumbnailLocalPath);

    const newVideo = await Video.create({
      title,
      description,
      videoFile: video?.url,
      thumbnail: thumbnail?.url,
      owner: req.user._id,
      duration: video?.duration,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Video published successfully", newVideo));
  } catch (error) {
    throw new ApiError(500, error?.message || "Video publishing failed");
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  try {
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(videoId),
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
                email: 1,
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
    ]);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Video fetched successfully", video));
  } catch (error) {
    throw new ApiError(500, error?.message || "Video fetching failed");
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId, title, description } = req.body;
  //TODO: update video details like title, description, thumbnail

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  if (!description) {
    throw new ApiError(400, "Description is required");
  }

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const localThumbnailFile = req.file?.path;

  if (!localThumbnailFile) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const thumbnail = await uploadMedia(localThumbnailFile);

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail?.url,
      },
    },
    {
      new: true,
    }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video updated successfully", video));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId, status } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: status || false,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Video status changed successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
