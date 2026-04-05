// Authentication middleware

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user_id) {
    // If API call, return 401
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // Otherwise redirect to login
    return res.redirect("/login");
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};
