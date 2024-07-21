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

        if (uniqueEmail && uniqueUsername) {
            return res.status(400).json({ error: `Both the email: ${email} and the username: ${username} already exist.` });
        }
        if (uniqueEmail) {
            return res.status(400).json({ error: `The email: ${email} already exists.` });
        }
        if (uniqueUsername) {
            return res.status(400).json({ error: `The username: ${username} already exists.` });
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
        res.status(201).json({ JWT_access, email: newUser.email, username: newUser.username });
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
        const JWT_access = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '2h'});
        console.log("User Logged in and Generated Token:", JWT_access);
        res.status(200).json({ JWT_access, email: user.email  });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `An Error Occured ${error}` });
    }
};


module.exports = {
    createNewUser,
    loginUser
}