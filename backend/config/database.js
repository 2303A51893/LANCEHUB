
const mongoose = require('mongoose');
require('dotenv').config();

const connectDatabase = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MONGODB_URI is missing from the .env file');
        }

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000
        });

        console.log('MongoDB Connected Successfully');
        console.log(`Database: ${mongoose.connection.name}`);

        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        throw error;
    }
};

const disconnectDatabase = async () => {
    try {
        await mongoose.disconnect();
        console.log('MongoDB Disconnected Successfully');
    } catch (error) {
        console.error('MongoDB Disconnection Failed:', error.message);
        throw error;
    }
};

module.exports = {
    connectDatabase,
    disconnectDatabase
};
