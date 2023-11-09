const jwt = require("jsonwebtoken");
// Middleware to verify JWT token
module.exports = function verifyToken(req, res, next) {
  const Btoken = req.headers["authorization"];
  
  const token = Btoken.split(' ')[1];
  console.log(token)


  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.username = decoded.username;
    next();
  });
};