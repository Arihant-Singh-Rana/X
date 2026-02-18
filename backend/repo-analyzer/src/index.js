require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const analyzeRoutes = require("./routes/analyze");

const app = express();

connectDB();

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  }),
);

const passport = require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/analyze", analyzeRoutes);

app.get("/", (req, res) => {
  res.json({ status: "running", message: "Repo Analyzer API" });
});

// mongoose connection check
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB ✅");
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error ❌", err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
