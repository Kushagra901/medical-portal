const Doctor = require('../models/Doctor');

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route"
      });
    }

    if (req.userRole !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only."
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only."
      });
    }
    next();
  } catch (err) {
    console.error("Admin authorization error:", err);
    res.status(500).json({ message: "Authorization error" });
  }
};

module.exports = requireAdmin;
