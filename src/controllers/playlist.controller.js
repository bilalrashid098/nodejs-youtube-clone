import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandle.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { _id } = req.user;

  if (!name) {
    throw new ApiError(400, "Name is missing");
  }

  if (!description) {
    throw new ApiError(400, "Description is missing");
  }

  try {
    const playlist = await Playlist.create({
      name,
      description,
      owner: _id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist created successfully", playlist));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in playlist controller"
    );
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    throw new ApiError(400, "User id is missing");
  }

  try {
    const playlist = await Playlist.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          videoCount: {
            $size: "$videos",
          },
          createdAt: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, "Video successfully added", playlist));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in playlist controller"
    );
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Playlist id is missing");
  }

  try {
    const playlist = await Playlist.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videos",
          pipeline: [
            {
              $project: {
                _id: 1,
                thumbnail: 1,
                videoFile: 1,
                title: 1,
                description: 1,
                owner: 1,
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
                      avatar: 1,
                      fullname: 1,
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
                avatar: 1,
                fullname: 1,
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

    if (playlist?.length < 1) {
      throw new ApiError(400, "No playlist for the provided id");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Video successfully added", playlist[0]));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in playlist controller"
    );
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.query;

  if (!playlistId) {
    throw new ApiError(400, "Playlist id is missing");
  }

  if (!videoId) {
    throw new ApiError(400, "Video id is missing");
  }

  try {
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $addToSet: {
          videos: videoId,
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Video successfully added", playlist));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in playlist controller"
    );
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.query;

  if (!playlistId) {
    throw new ApiError(400, "Playlist id is missing");
  }

  if (!videoId) {
    throw new ApiError(400, "Video id is missing");
  }

  try {
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: {
          videos: videoId,
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Video successfully removed", playlist));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in playlist controller"
    );
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.query;

  if (!playlistId) {
    throw new ApiError(400, "Playlist id is missing");
  }
  try {
    await Playlist.findByIdAndDelete(playlistId);
    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist successfully removed"));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in playlist controller"
    );
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId, name, description } = req.body;

  if (!playlistId) {
    throw new ApiError(400, "Playlist id is missing");
  }

  if (!name) {
    throw new ApiError(400, "Name is missing");
  }

  if (!description) {
    throw new ApiError(400, "Description is missing");
  }

  try {
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $set: { name, description },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist updated successfully", playlist));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in playlist controller"
    );
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
