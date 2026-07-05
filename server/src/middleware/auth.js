const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No authentication token, access denied" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedData?.id;
    if (!userId) {
      return res.status(401).json({ message: "Token is invalid or expired" });
    }

    // Revocation check: reject tokens issued before the user's tokenValidAfter
    // cutoff (bumped on password change / logout).
    const user = await User.findById(userId).select('tokenValidAfter');
    if (!user) {
      return res.status(401).json({ message: "Token is invalid or expired" });
    }
    if ((decodedData.iat || 0) < (user.tokenValidAfter || 0)) {
      return res.status(401).json({ message: "Session expired, please log in again" });
    }

    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};

module.exports = auth;
