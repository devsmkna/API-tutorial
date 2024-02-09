import bcrypt from "bcrypt";
import { User } from "../models/User";
import { Router, Request, Response } from "express";
import { body, param, matchedData, check } from "express-validator";
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
            password: userData.password,
            verifyed: false,
        });
        if (user.verifyed) return res.status(409).json({ message: "User already exists"} );
        try {
            user.verificationCode = v4();
            await user.save();
            return res.json({
                message: "User created, check your email to verify your account.",
                link: `http://localhost:3000/auth/verify/${user.verificationCode}`
            });
        } catch (e) {
            return res.status(409).json({message: e});
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
        if (!user) return res.status(404).json({ message: "User not found"} );
        user.verifyed = true;
        user.verificationCode = undefined;
        await user.save();
        res.json({ message: "User verified"} );
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
            return res.status(400).json({ message: "Invalid credential"} );
        }
        res.json({
            message: "User logged in",
            token: jwt.sign({ email: foundUser.email, name: foundUser.name, avatar: foundUser.avatar }, process.env.JWT_SECRET as string)
        });
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
        console.log(userData);
        const user = await User.findOneAndUpdate({ email: res.locals.user.email }, userData);
        if (!user) return res.status(404).json({ message: "User not found"} );
        res.json({
            message: "User updated",
            token: jwt.sign({ email: user.email, name: user.name, avatar: user.avatar }, process.env.JWT_SECRET as string)
        })
    }
)

// export router
export default router;