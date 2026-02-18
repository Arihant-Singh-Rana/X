const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user", "repo"],
  }),
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/auth/failed" }),
  (req, res) => {
    res.json({
      message: "Login successful ✅",
      user: {
        username: req.user.username,
        avatar: req.user.avatar,
      },
    });
  },
);

router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  res.json({
    username: req.user.username,
    avatar: req.user.avatar,
  });
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/failed", (req, res) => {
  res.status(401).json({ message: "GitHub login failed ❌" });
});

module.exports = router;
