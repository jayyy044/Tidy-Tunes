const User = require('../models/UserModel')

const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')

const bcrypt = require('bcrypt')

const createNewUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const [uniqueEmail, uniqueUsername] = await Promise.all([
            User.findOne({ email }),
            User.findOne({ username })
        ]);
        const count = await User.countDocuments()

        if (uniqueEmail && uniqueUsername) {
            console.log(`Both the email: ${email} and the username: ${username} already exist.`)
            return res.status(400).json({ error: `Both the email: ${email} and the username: ${username} already exist.` });
        }
        if (uniqueEmail) {
            console.log(`The email: ${email} already exists.`)
            return res.status(400).json({ error: `The email: ${email} already exists.` });
        }
        if (uniqueUsername) {
            console.log(`The username: ${username} already exists.`)
            return res.status(400).json({ error: `The username: ${username} already exists.` });
        }
        if(count>=10){
            console.log("This is the count", count);
            return res.status(400).json({ error: 'Max number of users reached' });
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });
        const JWT_access = jwt.sign({ email: newUser.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
        console.log("New User Created: ", newUser);
        res.status(200).json({ JWT_access, email: newUser.email, username: newUser.username,playlistId: newUser.playlistId, playlistName: newUser.playlistName  });
    } catch (error) {
        console.log("Failed to create new user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            console.log("No Such Email");
            return res.status(400).json({ error: 'Invalid Email' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log("No Such Password");
            return res.status(400).json({ error: 'Invalid Password' });
        }
        const JWT_access = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '90m'});
        console.log("User Logged in and Generated Token:", JWT_access);
        res.status(200).json({ JWT_access, email: user.email, playlistId: user.playlistId, playlistName: user.playlistName });
    } catch (error) {
        console.log("An error occured in logging user in: ", error.message);
        res.status(500).json({ error: `An Error Occured while trying to log user in` });
    }
};


module.exports = {
    createNewUser,
    loginUser
}