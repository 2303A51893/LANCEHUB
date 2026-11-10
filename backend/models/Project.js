
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'Web Development'
    },
    scope: {
        type: String,
        enum: ['Entry', 'Intermediate', 'Expert'],
        default: 'Intermediate'
    },
    budget: {
        type: Number,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    skillsRequired: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Open'
    },
    bidsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: 'projects'
});

module.exports = mongoose.model('Project', projectSchema);
