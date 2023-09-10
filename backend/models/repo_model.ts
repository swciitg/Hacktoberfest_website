import mongoose from "mongoose";

const repoSchema = new mongoose.Schema({
    repo_url: {
        type: String,
        required: true
    }
});

const HacktoberRepo = mongoose.model("HacktoberRepos",repoSchema);

export default HacktoberRepo;