
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bidAmount: {
        type: Number,
        required: true
    },
    deliveryDays: {
        type: Number,
        required: true
    },
    coverLetter: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    }
}, {
    timestamps: true,
    collection: 'bids'
});

module.exports = mongoose.model('Bid', bidSchema);
