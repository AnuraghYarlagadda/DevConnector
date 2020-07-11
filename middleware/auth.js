const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  //Get token from header
  const token = req.header("x-auth-token");

  //Check if no Token
  if (!token) {
    return res.status(401).json({ message: "No Token, Authorization denied" });
  }
  //Verify Token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({ message: "Token is invalid" });
  }
};
