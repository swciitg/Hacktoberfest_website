import mongoose, { Schema } from "mongoose";
import User from "./userModel";

const leaderboardSchema = new mongoose.Schema({
    github_id: {
        type: String,
        required: true
    },
    pull_requests_merged: {
        type: Number,
        default: 0
    }
});

const UserLeaderboard = mongoose.model("LeaderboardData", leaderboardSchema);

export default UserLeaderboard;