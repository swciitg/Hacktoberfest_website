import mongoose from "mongoose";

const adminControlSchema = new mongoose.Schema({
    hacktoberFestStartDate: {
        type: Date,
        required: true,
    },
    hacktoberFestEndDate: {
        type: Date,
        required: true,
    },
});

const AdminControl = mongoose.model("AdminControl", adminControlSchema);

export default AdminControl;