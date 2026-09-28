import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    github_id: {
        type: String,
        required: true
    },
    github_username: {
        type: String
    },
    avatar_url: {
        type: String
    },
    roll_no: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile_number: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },
    year_of_study: {
        type: String,
        required: true
    },
    programme: {
        type: String,
        required: true
    },
    // Optional legacy fields for backward compatibility
    outlook_email: {
        type: String
    },
    hostel: {
        type: String
    },
    department: {
        type: String
    }
});
const User = mongoose.model("Users", userSchema);
export default User;
