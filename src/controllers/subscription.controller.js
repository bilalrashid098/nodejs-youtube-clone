import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandle.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId, toggle } = req.body;
  // TODO: toggle subscription

  if (!channelId) {
    throw new ApiError(400, "Channel Id is missing");
  }

  if (toggle === null) {
    throw new ApiError(400, "Invalid toggle");
  }

  try {
    const channel = await User.findById(channelId);

    if (!channel) {
      throw new ApiError(400, "Invalid channel id");
    }

    if (toggle) {
      const subscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, "Subscription successfull", subscription));
    } else {
      const subscription = await Subscription.deleteOne({
        subscriber: req.user._id,
        channel: channelId,
      });
      return res
        .status(200)
        .json(new ApiResponse(200, "Unsubscription successfull", subscription));
    }
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong in subscription controller"
    );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.query;

  if (!channelId) {
    throw new ApiError(400, "Channel Id is missing");
  }

  try {
    const subscribers = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscriber",
          pipeline: [
            {
              $project: {
                _id: 1,
                fullname: 1,
                avatar: 1,
                cover: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          subscriber: 1,
        },
      },
      {
        $unwind: "$subscriber", // Unwind to flatten the subscriber array
      },
      {
        $replaceRoot: {
          newRoot: "$subscriber", // Replace root with the subscriber document
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Subscribers listing fetch successfully",
          subscribers
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong in subscription controller"
    );
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.query;
  if (!subscriberId) {
    throw new ApiError(400, "Subscriber Id is missing");
  }

  try {
    const channels = await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(subscriberId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channel",
          pipeline: [
            {
              $project: {
                _id: 1,
                fullname: 1,
                avatar: 1,
                cover: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          channel: 1,
        },
      },
      {
        $unwind: "$channel", // Unwind to flatten the channel array
      },
      {
        $replaceRoot: {
          newRoot: "$channel", // Replace root with the channel document
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Subscribers listing fetch successfully",
          channels
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong in subscription controller"
    );
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
