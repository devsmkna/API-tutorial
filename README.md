# How to make an API with typescript, Mongo DB Atlas and Express

**TLTR**: To run this project you need to run first `npm i` and then `npm start`.

## 1. Setup

### Setup environment
1. Create a new folder
2. Initialize npm with `npm init -y`
5. Install express with `npm i express` and `npm i --save-dev @types/express`
6. Install express-validator with `npm i express-validator` and `npm i --save-dev @types/express-validator`
7. Create a src folder for javascript generated files with `mkdir build`
8. Create a build folder for typescript files with `mkdir src`
9. Add to `package.json` on `scripts` the line `"start": "npm run build && node --watch ./src/index.js"` (build will be sets later)
10. Create `index.ts` on `src` folder

### Setup typescript
1. Install typescript with `npm i typescript`
2. Initialize typescript compiler with `tsc --init`
3. Modify `tsconfig.json` on lines `"rootDir": "./src"` and `"outDir": "./build"`, remember to uncomment them
4. Add to `package.json` on `scripts` the line `"build": "tsc"`

### Setup database
1. Go on `https://www.mongodb.com/cloud/atlas/register`, then Sign-in or Login
2. Create a new database
3. Go on `Database` voice on side menu
4. Click on `Connect > Drivers`, then copy the line of step 3 (something like `mongo+srv://...`)
5. Install mongoose with `npm i mongoose` and `npm i --save-dev @types/mongoose`

## 2. Create API

### Create app
1. Write on `index.ts`
1. Import `express`
3. Declare a `const app = express()`
4. Tell express that you will receive json as body in HTTPResponse with `app.use(express.json())`
5. Start the server with `app.listen(PORT)` where PORT is the port where your server is listening for request (usually is 3000)

### Connect MongoDB Atlas
1. Import `mongoose`
2. Connect to MongoDB Atlas with `mongoose.connect(URL)` where URL is the link copied on step 4 of [Setup Database](#setup-database)
   1. You can save on other const accountName, password and clusterName, so you can scale the project in the future
   2. Use then and catch to add info to your connection and handling connection error

### Create models
1. Create on src the folder `models`
2. Create a new file for MongoDB model (i.e. `User.ts`)
3. Import `{ Schema, model }` from mongoose
4. Create a typescript type with the structure of your model
5. Create a MongoDB schema with `const userSchema = new Schema<User>(STRUCTURE)`
   1. The Structure will match the typescript type, but you'll use the mongoose types and other options
6. Export the model with `export const User = model<User>("User", userSchema)`

### Create routing
1. Create on src the folder `routes`
2. Create a new file for routing endpoint group (i.e. `users.ts`)
3. Import express with `express, { Request, Response }`
4. Import the MongoDB model with `{ User }` from `../models/User`
5. Import express-validator with `{ body, params, matchedData }`
6. Create the router connected with the main app with `const router = express.Router()`
7. Create all the endpoints you need
   1. Get all users
   2. Get user by id
   3. Delete user by id
   4. Update user by id
   5. Create new user
8. Export the routing with `export default routing`

### Connect route to main app
1. Import `users` from `./routes/users`
2. Connect to app with `app.use("/users", users)`

### Create an auth route
1. Create on `src/routes` the file `auth.ts`
2. Install bcrypt with `npm i bcrypt` and `npm i --save-dev @types/bcrypt` for crypting passwords
3. Create the endpoint for signup (verb `post`)
   1. Get all user info within the body
   2. Crypt the password with `bcrypt`
   3. Generate the verify token with `v4`, install it with `npm i uuid` and `npm i --save-dev @types/uuid`
4. Create the endpoint for email verification (verb `get`)
   1. Find the user with the same token in the url
   2. If not verified, verify it
   3. Change info in db
5. Create the endpoint for login (verb `post`)
   1. Get all user info within the body
   2. Find the user already verified with same email and same crypted password

### Start the server
1. Start the server with `npm start`
2. Debug with postman