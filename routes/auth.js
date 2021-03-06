const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").delete(logout);
router.route("/me").get(protect, getMe);
router.route("/reset-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/update-details").put(protect, updateDetails);
router.route("/update-password").put(protect, updatePassword);

module.exports = router;
