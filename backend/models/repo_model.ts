import mongoose from "mongoose";

const repoSchema = new mongoose.Schema({
    repo_name: {
        type: String,
        required: true
    },
    repo_owner:{
        type:String,
        required:true
    }
});

const HacktoberRepo = mongoose.model("HacktoberRepos",repoSchema);

export default HacktoberRepo;