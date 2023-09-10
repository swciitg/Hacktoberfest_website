import mongoose, { Schema } from "mongoose";
import User from "./userModel";

const leaderboardSchema = new mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    pull_requests_merged: {
        type: Number,
        required: true
    }
});

const UserLeaderboard = mongoose.model("Users", leaderboardSchema);

export default UserLeaderboard;