import User from "../models/userSchema.js";
import CodeforcesService from "../services/codeforcesService.js";


const codeforcesService = new CodeforcesService();

// create a new user
export const createUser = async (req, res) => {
    try {
        const { handle } = req.body;

        if (!handle) {
            return res.status(400).send({ message: "User handle is required", success: false });
        }

        const existingUser = await User.findOne({ handle });

        if (existingUser) {
            return res.status(400).send({ message: "User is already added", success: false });
        }

        // fetch user data from codeforces using handle
        const { firstName, lastName, email, rank, rating, maxRating, avatar } = await codeforcesService.fetchUserInfo(handle);

        const userData = {
            handle,
            firstName,
            lastName,
            email,
            rank,
            rating,
            maxRating,
            avatar
        };

        console.log("User data received inside controller is", userData);

        const user = await User.create(userData);

        return res.status(201).send({ message: "Succesfully added the user", success: true, user });

    } catch (error) {
        return res.status(500).send({ message: "Unable to add user", success: false });
    }
};

// get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});

        return res.status(200).send({ message: "Succesfully fetched the users", success: true, users });
    } catch (error) {
        res.status(500).json({ message: "Error while fetching users.", success: false });
    }
};

// get a single user by handle
export const getUserByHandle = async (req, res) => {
    try {
        const user = await User.findOne({ handle: req.params.handle });
        if (!user) return res.status(404).json({ message: "User not found.", success: false });

        return res.status(200).send({ message: "Succesfully fetched the user", success: true, user });
    } catch (error) {
        res.status(400).json({ message: "Invalid user ID.", success: false });
    }
};

// update user by handle
export const updateUser = async (req, res) => {
    try {
        const oldHandle = req.params.handle;
        const newHandle = req.body.handle;

        if (!newHandle) {
            return res.status(400).json({ message: "New handle is required.", success: false });
        }

        const { firstName, lastName, email, rank, rating, maxRating, avatar } = await codeforcesService.fetchUserInfo(newHandle);

        const updatedUser = await User.findOneAndUpdate(
            { handle: oldHandle },
            {
                $set: {
                    handle: newHandle,
                    firstName,
                    lastName,
                    email,
                    rank,
                    rating,
                    maxRating,
                    avatar
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        return res.status(200).json({ message: "Successfully updated the user", success: true, user: updatedUser });
    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
};

// delete user by handle
export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findOneAndDelete({ handle: req.params.handle });
        if (!deletedUser) return res.status(404).json({ message: "User not found.", success: false });

        res.status(200).json({ message: "User deleted successfully.", success: true });
    } catch (error) {
        res.status(400).json({ message: "Invalid user ID.", success: false });
    }
};
