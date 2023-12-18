const express = require ('express');
const { registerUser, loginUser, getUserByID, getAllUsers } = require('../controllers/userController')
const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/:id", getUserByID);
router.get("/", getAllUsers);

module.exports = router;
