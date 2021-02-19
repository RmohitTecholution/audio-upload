const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    output_filename: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    originalname: {
        type: String,
        required: true
    },
    download_link: {
        type: String,
        required: true
    },
    job_status: {
        type: String,
        required: true
    }
});
const uploadModel = mongoose.model('uploads', uploadSchema);

module.exports = uploadModel;