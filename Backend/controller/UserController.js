const User = require('../models/UserModel')

const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')

const bcrypt = require('bcrypt')

const createNewUser = async(req, res) => {
    const {username, email, password} = req.body
    const uniqueEmail = await User.findOne({ email });
    const uniqueUsername = await User.findOne({ username })
    if(uniqueEmail && uniqueUsername){
        return res.status(400).json({ error: `Both he email: ${email} and the username ${username} already exists` });
    }
    if (uniqueEmail) {
        return res.status(400).json({ error: `The email: ${email} already exists` });
    }
    if(uniqueUsername){
        return res.status(400).json({ error: `The username: ${username} already exists` });
    }
   try{
        const salt = await bcrypt.genSalt()
        const hasedPassword = await bcrypt.hash(password, salt)
        const newUser = await User.create({
            username,
            email,
            password:hasedPassword
        })
        console.log(newUser, "New User Created")
        res.status(200).json(newUser)
   }
   catch (error){
        console.log("Failed to create new user")
        res.status(400).json({error: error.message})
   }
}

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
        console.log("User Logged in");
        const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET)
        console.log("Generated Token:", token);
        res.status(200).json({ message: 'User logged in successfully', token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error Logging In' });
    }
};

module.exports = {
    createNewUser,
    loginUser
}