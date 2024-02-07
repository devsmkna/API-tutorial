import { User } from "../models/User";
import { Router, Request, Response } from "express";
import { body, param, matchedData } from "express-validator";

// connect router to main app
const router = Router();

// get all users
router.get("/", async (req: Request, res: Response) => {
    const users = await User.find();
    res.send(users);
});

// get user by id
router.get("/:id", async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    res.send(user);
});

// delete user by id
router.delete("/:id", async (req: Request, res: Response) => {
    await User.findByIdAndDelete(req.params.id);
    res.send("User deleted");
});

// update user
router.put("/:id", async (req: Request, res: Response) => {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.send("User updated");
});

// create user
router.post("/", async (req: Request, res: Response) => {
    const user = new User(req.body);
    await user.save();
    res.send("User created");
});

// export router
export default router;