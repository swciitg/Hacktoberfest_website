import mongoose from "mongoose";


const repoSchema = new mongoose.Schema({
  repo_id: {
    type: Number,
    required: true,
  },
  owner: {
    type: String,
  },
  repo: {
    type: String,
  },
  pullRequestCounts: {
    type: mongoose.Schema.Types.Mixed, 
  },
  ownerProfileImage: {
    type: String,
  },
  techStacks: [String],
  description: {
    type: String,
  },
  starCounts: {
    type: Number,
  },
});

const HacktoberRepo = mongoose.model("HacktoberRepos", repoSchema);

export default HacktoberRepo;
