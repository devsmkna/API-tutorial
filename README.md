# How to make an API with typescript, Mongo DB Atlas and Express

**TLTR**: To run this project you need to run first `npm i` and then `npm start`.

## 1. Setup

### 1.1 Setup project
1. Create the project folder
2. Initialize **npm** with `npm init -y`
5. Install **express** with `npm i express` and `npm i --save-dev @types/express`
6. Install **express-validator** with `npm i express-validator` and `npm i --save-dev @types/express-validator`
7. Create a `src` folder for javascript generated files with `mkdir build`
8. Create a `build` folder for typescript files with `mkdir src`
9. Add to `package.json` on `scripts` the line `"start": "npm run build && node --watch ./src/index.js"` (build will be sets later)
10. Create on `src` the file `index.ts`

### 1.2 Setup typescript
1. Install **typescript** with `npm i typescript`
2. Initialize **typescript** compiler with `tsc --init`
3. Modify `tsconfig.json` on lines `"rootDir": "./src"` and `"outDir": "./build"`
   1. Remember to uncomment them before saving
4. Add to `package.json` on `scripts` the line `"build": "tsc"`

### 1.3 Setup database
1. Go on `https://account.mongodb.com/account/login`, then Sign-in or Login
2. Create a new database
3. Go on `Database` voice on side menu
4. Click on `Connect > Drivers`, then copy the line of step 3 *(something like `mongo+srv://...`)*
5. Install **mongoose** with `npm i mongoose` and `npm i --save-dev @types/mongoose`

### 1.4 Setup environment file
1. Create `.env` file
2. Install **dotenv** with `npm i dotenv` and `npm i --save-dev @types/dotenv`
3. Open it and write `DBURL=URL`
   1. URL is the link copied on **step 4** of [1.3 Setup Database](#setup-database)

## 2. Create API

### 2.1 Create app
1. Open `index.ts`
1. Import **express** with `import express from "express"`
2. Import **path** with `import path from "path"`
3. Declare a `const app = express()`
4. Tell express that you will receive json as body in HTTPResponse with `app.use(express.json())`
5. Connect the environment file with `require("dotenv").config({ path: path.join(__dirname, "../.env") })`
6. Start the server with `app.listen(PORT)`
   1. PORT is the port where your server is listening for request (usually is 3000)
   2. Remember to keep this line as the last one in the file

### 2.2 Connect MongoDB Atlas
1. Import **mongoose** with `import mongoose from "mongoose"`
2. Connect to MongoDB Atlas with `mongoose.connect(process.env.DBURL as string)`
   1. Use then and catch to add info to your connection and handling connection error

### 2.3 Create models
1. Create on `src` the folder `models`
2. In this folder create a **new file** for your database model *(looks at `src/models/Companies.ts`)*
3. Import the useful tools from mongose with `import { Schema, model } from "mongoose"`
4. Create a typescript type of the structure of your model with `type User`
5. Create a MongoDB schema with `const userSchema = new Schema<User>(STRUCTURE)`
   1. User is the typescript type you've created on step 4
   2. STRUCTURE will match the typescript type, but you'll use the mongoose types and other options like required and unique
6. Export the model with `export const User = model<User>("User", userSchema)`

### 2.4 Create middleware
1. Create on `src` the folder `middlewares`
2. In this folder create `validations.ts`
3. Import **express** useful tools with `import { Request, Response, NextFunction } from "express"`
4. Import **express-validate** useful tools with `import { validationResult } from "express-validator"`
5. Create the validation of data function *(looks at `src/middlewares/validations.ts` file)*

### 2.5 Create routing
1. Create on `src` the folder `routes`
2. In this folder create a **new file** for a group of routing endpoints *(looks at `src/routes/companies.ts`)*
3. Import **express** and useful tools with `import express, { Request, Response } from "express"`
4. Import the MongoDB model with `import { Model } from "../models/Model"`
5. Import **express-validator** useful tolls with `import { body, params, matchedData } from "express-validator"`
6. Create the router connected with the main app with `const router = express.Router()`
7. Create all the endpoints you need, some examples:
   1. Get all companies (verb GET)
   2. Get company by id (verb GET)
   3. Delete company by id (verb DELETE)
   4. Update company by id (verb PATCH)
   5. Create new company (verb POST)
8. Export the routing with `export default router`

### 2.6 Connect route to main app
1. Import route to the main app with `import companies from "./routes/companies"`
2. Connect to app with `app.use("/companies", companies)`

### 2.7 Create an auth route
1. Create on `src/routes` the file `auth.ts`
2. Install **bcrypt** with `npm i bcrypt` and `npm i --save-dev @types/bcrypt` for crypting passwords
3. Create the endpoint for **signup** (verb POST)
   1. Get all user info within the body
   2. Crypt the password with `bcrypt`
   3. Generate the verify token with `v4`
      1. Install it with `npm i uuid` and `npm i --save-dev @types/uuid`
      2. Import **uuid** with `import { v4 } from "uuid"`
4. Create the endpoint for **email verification** (verb GET)
   1. Find the user with the same token in the url
   2. If not verified, verify it
   3. Change info in db
5. Create the endpoint for **login** (verb POST)
   1. Get all user info within the body
   2. Find the user already verified with same email and same crypted password

### 2.8 Create auth middleware
1. Install **jwt** with `npm i jsonwebtoken` and `npm i --save-dev @types/jsonwebtoken`
2. Add **jwtSalt** in `.env` file with `JWTSALT="STRING"`
   1. You can insert your custom string
3. Open `src/middlewares/validations.ts`
4. Import **jwt** with `import jwt from "jsonwebtoken"`
5. Write the auth validation *(looks at `src/middlewares/validations.ts`)*
6. Open `src/routes/auth.ts`
7. Import **jwt** with `import jwt from "jsonwebtoken"`
8. Create the endpoint for view the logged user (verb GET)
   1. Using postman pass in the header the token of jwt (the encrypted json)
   2. Use the auth middleware
   3. Return the logged user
9. Create the endpoint for change data of the logged user (verb PATCH)
   1.  Find the user by email from `res.locals.user` and update new data
   2.  Re-generate the token of jwt (the encrypted json)

# 3. Start the server

Run the project with `npm i` and then `npm start`. *For debugging purpose you can download Postman.*