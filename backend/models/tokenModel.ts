import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    access_token: {
        type: String,
        required: true
    },
    github_id: {
        type: String,
        required: true
    }
});

const UserTokenInfo = mongoose.model("UserTokenInfo",tokenSchema);

export default UserTokenInfo;