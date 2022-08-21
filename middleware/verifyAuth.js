const jwt = require('jsonwebtoken');

const verifyAuth = (req, res, next) => {
  // console.log(req);
  console.log('req.headers.auth: ', req.headers.auth);
    const authHeader = req.headers.auth || req.headers.Auth;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    console.log(token)
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403); //invalid token
            next();
        }
    );
}

module.exports = verifyAuth