import bcrypt from "bcrypt";
import { User } from "../models/User";
import { Router, Request, Response } from "express";
import { body, param, matchedData } from "express-validator";
import { v4 } from "uuid";

// connect router to main app
const router = Router();

// generate salt for crypting passwords
const salt = bcrypt.genSaltSync(10);

// signup
router.post(
    "/signup",
    body("name").trim(),
    body("email").isEmail(),
    body("password").isStrongPassword(),
    async (req: Request, res: Response) => {
        const user = matchedData(req);
        const existUser = await User.findOne({ email: user.email });
        if (existUser) {
            // user already exists
            if (existUser.verifyed) return res.status(409).send("User already exists"); // already verified
            // not verified
            try {
                existUser.token = v4();
                existUser.save();
                res.send("User created, check your email to verify your account with the link: http://localhost:3000/auth/verify/" + existUser.token);
            } catch (e) {
                res.status(409).json({message: e});
            }
        } else {
            // new user
            try {
                const newUser = new User({
                    name: user.name,
                    email: user.email,
                    password: bcrypt.hashSync(user.password, salt),
                    verifyed: false,
                    token: v4()
                });
                await newUser.save();
                res.send("User created, check your email to verify your account with the link: http://localhost:3000/auth/verify/" + newUser.token);
            } catch (e) {
                res.status(409).json({message: e});
            }
        }
    }
)

// verify email
router.get(
    "/verify/:token",
    async (req: Request, res: Response) => {
        const user = await User.findOne({ token: req.params.token });
        if (!user) {
            return res.status(404).send("User not found");
        }
        user.verifyed = true;
        user.token = "";
        await user.save();
        res.send("User verified");
    }
)

// login
router.post(
    "/login",
    body("email").isEmail(),
    body("password").isStrongPassword(),
    async (req: Request, res: Response) => {
        const user = matchedData(req);
        const foundUser = await User.findOne({ email: user.email, verifyed: true });
        if (!foundUser || !bcrypt.compareSync(user.password, foundUser.password)) {
            return res.status(400).send("Invalid credential");
        }
        res.send(foundUser);
    }
)

// export router
export default router;