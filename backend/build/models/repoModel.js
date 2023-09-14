import mongoose from "mongoose";
const repoSchema = new mongoose.Schema({
    repo_id: {
        type: Number,
        required: true
    }
});
const HacktoberRepo = mongoose.model("HacktoberRepos", repoSchema);
export default HacktoberRepo;
