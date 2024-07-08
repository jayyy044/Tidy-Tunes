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
        const JWT_access = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '2h'});
        console.log("User Logged in and Generated Token:", token);
        res.status(200).json({ JWT_access, username: user.username  });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `An Error Occured ${error}` });
    }
};


module.exports = {
    createNewUser,
    loginUser
}