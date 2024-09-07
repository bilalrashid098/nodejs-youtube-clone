import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandle.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { _id } = req.user._id;

  if (!_id) {
    throw new ApiError(400, "User id is missing");
  }

  const views = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(_id),
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$views" },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
      },
    },
  ]);

  const videos = await Video.countDocuments({
    owner: new mongoose.Types.ObjectId(_id),
  });

  const likes = await Like.countDocuments({
    likeBy: new mongoose.Types.ObjectId(_id),
    video: { $ne: null },
  });

  const subscribers = await Subscription.countDocuments({
    channel: new mongoose.Types.ObjectId(_id),
  });

  const data = {
    videos: videos || 0,
    likes: likes || 0,
    subscribers: subscribers || 0,
    views: views[0]?.total || 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, "Channel stats fetched", data));
});

export { getChannelStats };
