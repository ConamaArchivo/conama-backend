const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log('email: ', email);
  console.log('password: ', password);
    
    if (!email || !password) return res.status(400).json({ 'message': 'Username and password are required.' });

    const foundUser = await User.findOne({ email: email }).exec();
    if (!foundUser) return res.sendStatus(401); //Unauthorized 
    // evaluate password 
    console.log('foundUser: ', foundUser);
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "email": foundUser.email,
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '60s' }
        );
        const refreshToken = jwt.sign(
            { "email": foundUser.email },
            process.env.REFRESH_TOKEN_SECRET,
        );
        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();
        console.log(result);

        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

        res.json({ accessToken });

    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin };