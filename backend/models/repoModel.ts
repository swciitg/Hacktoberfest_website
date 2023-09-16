import mongoose from "mongoose";


const repoSchema = new mongoose.Schema({
  repo_id: {
    type: Number,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  repo: {
    type: String,
    required: true,
  },
  pull_request_count: {
    type: mongoose.Schema.Types.Mixed, 
    default: 0
  },
  avatar_url: {
    type: String,
  },
  techStacks: [String],
  description: {
    type: String,
  },
  starCounts: {
    type: Number,
  },
  type: {
    type: String,
    enum: ["IITG","NON-IITG"],
    required: true
  }
});

const HacktoberRepo = mongoose.model("HacktoberRepos", repoSchema);

export default HacktoberRepo;
