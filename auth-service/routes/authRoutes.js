const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh-token", authController.refreshToken); // New route for refreshing token
router.post("/verify", authController.verifyToken);
router.post("/getUser", authController.getUser);

module.exports = router;
