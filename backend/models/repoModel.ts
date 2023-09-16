import mongoose from "mongoose";

const repoSchema = new mongoose.Schema({
    repo_id:{
        type:Number,
        required:true
    },
    repo_owner:{
        type:String
    },
    repo_name:{
        type:String
    },
    repo_mergedPR_counts:{
        type:Number
    },
    repo_profile_img:{
        type:String
    },
    repo_techStacks:{
        type:[String]
    },
    repo_description:{
        type:String
    }
});

const HacktoberRepo = mongoose.model("HacktoberRepos",repoSchema);

export default HacktoberRepo;