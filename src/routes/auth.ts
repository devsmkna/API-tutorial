import bcrypt from "bcrypt";
import { User } from "../models/User";
import { Router, Request, Response } from "express";
import { body, param, matchedData } from "express-validator";
import { v4 } from "uuid";
import { auth, checkValidation } from "../middlewares/validations";
import jwt from "jsonwebtoken";

// connect router to main app
const router = Router();

// generate salt for crypting passwords
const salt = bcrypt.genSaltSync(10);

// signup
router.post(
    "/signup",
    body("name").trim().notEmpty(),
    body("email").trim().notEmpty().isEmail(),
    body("password").trim().isStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),
    body("avatar").trim().notEmpty().isURL().optional(),
    checkValidation,
    async (req: Request, res: Response) => {
        const userData = matchedData(req);
        const user = await User.findOne({ email: userData.email }) || new User({
            name: userData.name,
            email: userData.email,
            password: bcrypt.hashSync(userData.password, salt),
            verifyed: false,
        });
        if (user.verifyed) return res.status(409).json({ error: "User already exists" });
        try {
            user.verificationCode = v4();
            await user.save();
            return res.status(201).json({
                message: "User created, check your email to verify your account.",
                id: user.id
            });
        } catch (err) {
            return res.status(400).json({ error: err });
        }
    }
)

// verify email
router.get(
    "/verify/:id",
    param("id").isUUID(),
    checkValidation,
    async (req: Request, res: Response) => {
        const user = await User.findOne({ verificationCode: req.params.id });
        if (!user) return res.status(404).json({ error: "User not found" });
        user.verifyed = true;
        user.verificationCode = undefined;
        await user.save();
        return res.json({
            message: "User verified",
            id: user.id
        });
    }
)

// login
router.post(
    "/login",
    body("email").trim().notEmpty().isEmail(),
    body("password").trim().isStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),
    checkValidation,
    async (req: Request, res: Response) => {
        const user = matchedData(req);
        const foundUser = await User.findOne({ email: user.email, verifyed: true });
        if (!foundUser || !bcrypt.compareSync(user.password, foundUser.password)) {
            return res.status(400).json({ error: "Invalid credential" });
        }
        return res.json({
            message: "User logged in",
            auth: jwt.sign({ email: foundUser.email, name: foundUser.name, avatar: foundUser.avatar }, process.env.JWT_SECRET as string)
        });
    }
)

// recover password
router.post(
    "/reset",
    body("email").trim().notEmpty().isEmail(),
    checkValidation,
    async (req: Request, res: Response) => {
        const userData = matchedData(req);
        const user = await User.findOne({ email: userData.email, verifyed: true });
        if(!user) return res.status(404).json({ error: "User not found" });
        try {
            user.resetPasswordCode = v4();
            await user.save();
            return res.json({
                message: "Recover password link sent to email",
                auth: jwt.sign({ email: user.email, name: user.name, avatar: user.avatar }, process.env.JWT_SECRET as string)
            })
        } catch (err) {
            return res.status(400).json({ error: err });
        }
    }
)

router.patch(
    "/reset/:id",
    body("password").trim().isStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),
    param("id").isUUID(),
    checkValidation,
    auth,
    async (req: Request, res: Response) => {
        const userData = matchedData(req);
        const user = await User.findOneAndUpdate({ email: res.locals.user.email, verifyed: true }, { password: bcrypt.hashSync(userData.password, salt) });
        if(!user) return res.status(404).json({ error: "User not found" });
        return res.json({ message: "Password changed" });
    }
)

// get current logged user
router.get(
    "/me",
    auth,
    async (req: Request, res: Response) => {
        return res.json(res.locals.user);
    }
)

// change current logged user info
router.patch(
    "/me",
    body("name").trim().notEmpty().optional(),
    body("avatar").trim().notEmpty().isURL().optional(),
    checkValidation,
    auth,
    async (req: Request, res: Response) => {
        const userData = matchedData(req);
        const user = await User.findOneAndUpdate({ email: res.locals.user.email }, userData);
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.json({
            message: "User updated",
            auth: jwt.sign({ email: user.email, name: user.name, avatar: user.avatar }, process.env.JWT_SECRET as string)
        })
    }
)

// export router
export default router;