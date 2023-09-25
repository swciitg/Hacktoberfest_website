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
    outlook_email: {
        type: String,
        required: true
    },
    programme: {
        type: String,
        enum: ['B.Tech', 'M.Tech', 'Ph.D', 'M.Sc', 'B.Des', 'M.Des', 'M.S.(R)', 'M.A.', 'MBA', 'MTech+PhD', 'M.S. (Engineering) + PhD'],
        required: true
    },
    hostel: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    year_of_study: {
        type: String,
        enum: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
        required: true
    },
});
const User = mongoose.model("Users", userSchema);
export default User;
