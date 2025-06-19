import express from "express";

import { createUser, getAllUsers, getUserByHandle, deleteUser, updateUser } from "../../controllers/userController.js";
import { getContestHistory } from "../../controllers/contestController.js";
import { getProblemStats } from "../../controllers/submissionsController.js";

const router = express.Router();

// user main table routes
router.get('/users', getAllUsers);       // GET all users
router.get('/users/:handle', getUserByHandle);   // GET user by handle
router.post('/users', createUser);       // Create new user
router.put('/users/:handle', updateUser);    // Update user
router.delete('/users/:handle', deleteUser); // Delete user

// contest routes
router.get('/contests/:handle', getContestHistory);

// submissions routes
router.get('/submissions/:handle', getProblemStats);

export { router };