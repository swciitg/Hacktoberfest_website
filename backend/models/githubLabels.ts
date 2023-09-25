import mongoose from "mongoose";

const labelSchema=new mongoose.Schema({
    label_type:{
      type:String
    }
});

const githubLabels=mongoose.model("githubLabels",labelSchema);
export default githubLabels;