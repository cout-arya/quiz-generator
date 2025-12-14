const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testAuth() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const username = 'debug_user_' + Math.floor(Math.random() * 1000);
        const password = 'password123';

        console.log(`Creating user: ${username}`);
        const user = new User({ username, password });
        await user.save();
        console.log('User saved.');

        const fetchedUser = await User.findOne({ username });
        console.log('User fetched:', fetchedUser.username);
        console.log('Hashed Password:', fetchedUser.password);

        const isMatch = await bcrypt.compare(password, fetchedUser.password);
        console.log(`Password Match for '${password}':`, isMatch);

        if (!isMatch) console.error('BCRYPT COMPARISON FAILED!');
        else console.log('Auth Logic Objectively Working.');

        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

testAuth();
