import mongoose, { Schema } from "mongoose";
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
const UserLeaderboard = mongoose.model("LeaderboardData", leaderboardSchema);
export default UserLeaderboard;
