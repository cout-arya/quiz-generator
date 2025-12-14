const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const username = 'host_final';
        // Check if exists and remove
        await User.deleteOne({ username });

        const user = new User({ username, password: 'pass_final' });
        await user.save(); // Pre-save hook will hash it
        console.log('User host_final created.');
        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}
createUser();
