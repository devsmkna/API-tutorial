# How to make an API with typescript, Mongo DB Atlas and Express

After download this project you can run it with:
```bash
npm i
npm start
```

## 1. Setup

### 1.1 Setup project

Create the project directory and setup **npm**:
```bash
mkdir project-directory && cd project-directory
npm init -y
```

Install **typescript**:
```bash
npm i typescript
tsc --init
```

Install npm **dependencies**:
```bash
npm i express && npm i --save-dev @types/express
npm i express-validator && npm i --save-dev @types/express-validator
npm i mongoose && npm i --save-dev @types/mongoose
npm i bcrypt && npm i --save-dev @types/bcrypt
npm i uuid && npm i --save-dev @types/uuid
npm i dotenv && npm i --save-dev @types/dotenv
```

Create the **directories** for typescript and javascript files:
```bash
mkdir src build
```

On `tsconfig.json` uncomment and **change** lines:
```json
"rootDir": "./src",
...
"outDir": "./build",
```

On `package.json` under **script** add the following lines:
```json
"build": "tsc",
"start": "npm run build && node ./build/app.ts"
```

### 1.2 Setup MongoDB Atlas

1. Go on `https://account.mongodb.com/account/login` to Sign-in or Sign-up to your MongoDB account.
2. In the side menu go to `Database`, then click on `Connect`, in the pop-up select `Drivers`.
3. In the drop-down menu `Node.js` must be the selected voice.
4. Copy the server url *(something likes `mongo+srv://...`)*

On `.env` create **environment variables** paste the server url:
```.env
DBURL=mongo+srv://...
PORT=3000
JWT_SECRET=shhhh
```

## 2. Create API

### 2.1 Create app

On `src/app.ts`:
```ts
import express from "express";
import mongoose from "mongoose";
import path from "path";

const app = express();
app.use(express.json());

require("dotenv").config({
   path: path.join(__dirname, "../env")
});

mongoose.connect(process.env.DBURL as string)
   .then(() => console.log("Connected to MongoDB Atlas"))
   .catch((err) => console.log("Error while connecting to MongoDB Atlas", err));

app.listen(process.env.PORT,
   () => console.log("Server listening on port", process.env.PORT));
```

### 2.2 Create models

Create on `src` the folder `models`. In this folder create a file for each MongoDB models. For example:

`src/models/Company.ts`
```ts
import { Schema, model } from "mongoose";

type Company = {
   name: string,
   established: number,
   website?: string
};

const schema = new Schema<Company>({
   name: {
      type: String,
      required: true
   },
   established: {
      type: Number,
      required: true
   },
   website: {
      type: String,
      unique: true
   }
});

export default model<Company>("Company", schema);
```

### 2.3 Create middleware

Create on `src` the folder `middlewares`. In this folder create the middleware, such as:

`src/middlewares/validations.ts`
```ts
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";

export const checkValidation = (req: Request, res: Response, next: NextFunction) => {
   const errors = validationResult(req);
   if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
   next();
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
   res.locals.user = jwt.verify(
      req.headers.authorization as string, 
      process.env.JWT_SECRET as string
   );
   next();
}
```
### 2.4 Create routes

Create on `src` the folder `routes`. In this folder create the route for group of endpoints. For example:

`src/routes/companies.ts`
```ts
import express, { Request, Response } from "express";
import { body, params, matchedData } from "express-validator";
import { Company } from "../models/Company"

const router = express.Router();
```

Create the endpoint to **get all companies**:
```ts
router.get(
   "/", 
   async (req: Request, res: Response) => {
      return res.send(await Company.find());
});
```

Create the endpoint to **get a company by id**:
```ts
router.get(
    "/:id",
    param("id").isMongoId(),
    checkValidation,
    async (req: Request, res: Response) => {
      const company = await Company.findById(req.params.id);
      if (!company)
         return res.status(404).json({ message: "Company not found" });
      return res.json(company);
});
```

Create the endpoint to **delete a company by id**
```ts
router.delete(
   "/:id",
   param("id").isMongoId(),
   checkValidation,
   async (req: Request, res: Response) => {
      await Company.findByIdAndDelete(req.params.id);
      const company = await Company.findById(req.params.id);
      if (company)
         return res.status(404).json({ error: "Company not found" });
      return res.json({ message: "Company deleted" });
});
```

Create the endpoint to **update a company by id**
```ts
router.patch(
   "/:id", 
   body("name").trim().notEmpty().optional(),
   body("established").isInt({ gt: 0 }).optional(),
   body("website").trim().notEmpty().isURL().optional(),
   param("id").isMongoId(),
   checkValidation,
   async (req: Request, res: Response) => {
      await Company.findByIdAndUpdate(req.params.id, matchedData(req));
      const company = await Company.findById(req.params.id);
      if (!company)
         return res.status(404).json({ error: "Company not found" });
      return res.json({ message: "Company updated" });
});
```

Create the endpoint to **add a new company**
```ts
router.post(
   "/",
   body("name").trim().notEmpty(),
   body("established").isInt({ gt: 0 }),
   body("website").trim().notEmpty().isURL().optional(),
   checkValidation,
   async (req: Request, res: Response) => {
      try {
         const company = new Company(matchedData(req));
         if (await Company.findOne({ name: company.name }))
            return res.status(409).json({ message: "Company already exists" });
         const savedCompany = await company.save();
         return res.json(savedCompany);
      } catch (e) {
         return res.status(409).json({ error: e });
      }
});
```

At the end of the file export the router:
```ts
export default router;
```

### 2.5 Connect route to main app

On `src/app.ts`:
```ts
import companies from "./routes/companies";

app.use("/companies", companies);
```

### 2.6 Create an auth route

Create on `src/routes` the file `auth.ts` with this imports:
```ts
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { Router, Request, Response } from "express";
import { body, param, matchedData } from "express-validator";
import { v4 } from "uuid";
import { auth, checkValidation } from "../middlewares/validations";
```

Create the endpoint for **signup**:
```ts
router.post(
   "/signup",
   body("name").trim().notEmpty(),
   body("email").trim().notEmpty().isEmail(),
   body("password").trim().isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1 
   }),
   body("avatar").trim().notEmpty().isURL().optional(),
   checkValidation,
   async (req: Request, res: Response) => {
      const userData = matchedData(req);
      const user = await User.findOne({ email: userData.email }) ||
         new User({
            name: userData.name,
            email: userData.email,
            password: bcrypt.hashSync(userData.password, salt),
            verifyed: false,
         });
      if (user.verifyed)
         return res.status(409).json({ error: "User already exists" });
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
```

Create endpoint for **email verification**:
```ts
router.get(
   "/verify/:id",
   param("id").isUUID(),
   checkValidation,
   async (req: Request, res: Response) => {
      const user = await User.findOne({ verificationCode: req.params.id });
      if (!user)
         return res.status(404).json({ error: "User not found" });
      user.verifyed = true;
      user.verificationCode = undefined;
      await user.save();
      return res.json({
         message: "User verified",
         id: user.id
      });
   }
)
```

Create endpoint for **login**:
```ts
router.post(
   "/login",
   body("email").trim().notEmpty().isEmail(),
   body("password").trim().isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
   }),
   checkValidation,
   async (req: Request, res: Response) => {
      const user = matchedData(req);
      const foundUser = await User.findOne({
         email: user.email,
         verifyed: true
      });
      if (!foundUser || !bcrypt.compareSync(user.password, foundUser.password))
         return res.status(400).json({ error: "Invalid credential" });
      return res.json({
         message: "User logged in",
         auth: jwt.sign({
            email: foundUser.email,
            name: foundUser.name,
            avatar: foundUser.avatar
         }, process.env.JWT_SECRET as string)
      });
   }
)
```

## 3. Create test

Create on `src` the folder `tests`. In this folder you will test the endpoints beheviours. For example:

`src/tests/auth.ts`
```ts
import request from "supertest";
import app from "../index";
import { User } from "../models/User";
import assert from "assert";

describe("Testing Signup", () => {
   let idUser: string;
   afterEach("Delete user after test", async () => {
      await User.findByIdAndDelete(idUser);
   });
   it("Testing 200 Successful signup", async () => {
      const response = await request(app)
         .post("/auth/signup")
         .send({
            name: "DevsMachna",
            email: "devsmachna@email.com",
            password: "{StrongPassword1}"
         });
      assert.equal(response.status);
      assert.equal(typeof response.body.id, typeof "string");
      idUser = response.body.id;
   });
   it("Testing 400 Missing email", async () => {
      const response = await request(app)
         .post("/auth/signup")
         .send({
            name: "DevsMachna",
            password: "{StrongPassword1}"
         });
      assert.equal(response.status, 400);
   });
   it("Testing 400 Weak password", async () => {
      const response = await request(app)
         .post("/auth/signup")
         .send({
            name: "DevsMachna",
            email: "devsmachna@email.com",
            password: "1234"
         });
      assert.equal(response.status, 400);
   });
})
```


## 4. Start the server

```bash
npm start
```