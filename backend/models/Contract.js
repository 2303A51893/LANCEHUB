
const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
        default: null
    },
    contractValue: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Terminated'],
        default: 'Active'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    },
    terms: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    collection: 'contracts'
});

module.exports = mongoose.model('Contract', contractSchema);
