import express from 'express';

import { 
  loginController,
  logoutController,
  profileController,
  signupController,
  requestPasswordResetController,
  resetPasswordController,} from '../controllers/authController.js'; // named import from ESM controller
import {verifyJwt} from '../middlewares/authMiddleware.js'


const router = express.Router();

router.post("/login", loginController);
router.post("/signup", signupController);
router.get("/profile", verifyJwt, profileController);
router.post("/logout", logoutController);

// Step-wise password reset routes
router.post("/request-reset", requestPasswordResetController); // Step 1: Send email
router.post("/reset-password", resetPasswordController);


// Route for failed authentication
router.get('/failure', (req, res) => {
  res.status(401).json({ error: 'Authentication Failed' });
});




export default router;
