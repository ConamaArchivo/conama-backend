const User = require('../models/user');
const bcrypt = require('bcrypt');

const handleSignup = async (req, res) => {
  const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ 'message': 'Username and password are required.' });

    // check for duplicate usernames in the db
    const duplicate = await User.findOne({ email: email }).exec();
    if (duplicate) return res.sendStatus(409); //Conflict 

    try {
        //encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create and store the new user
        const result = await User.create({
            "email": email,
            "password": hashedPassword
        });

        console.log(result);

        res.status(201).json({ 'success': `New user ${email} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleSignup };