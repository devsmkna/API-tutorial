import request from "supertest";
import app from "../index";
import { User } from "../models/User";
import assert from "assert";


describe("Testing Auth", () => {
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
            assert.equal(response.status, 201, "User not created");
            assert.equal(typeof response.body.id, typeof "string", "User ID not a string");
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
        it("Testing 400 Missing password", async () => {
            const response = await request(app)
                .post("/auth/signup")
                .send({
                    name: "DevsMachna",
                    email: "devsmachna@email.com"
                });
            assert.equal(response.status, 400);
        });
        it("Testing 400 Missing name", async () => {
            const response = await request(app)
                .post("/auth/signup")
                .send({
                    email: "devsmachna@email.com",
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
        it("Testing 409 User already exists", async () => {
            // signup
            const signupResponse = await request(app)
                .post("/auth/signup")
                .send({
                    name: "DevsMachna",
                    email: "devsmachna@email.com",
                    password: "{StrongPassword1}"
                });
            assert.equal(signupResponse.status, 201, "User not created");
            assert.equal(typeof signupResponse.body.id, typeof "string", "User ID not a string");
            idUser = signupResponse.body.id;
            // verify
            const user = await User.findById(idUser);
            const verifyResponse = await request(app)
                .get(`/auth/verify/${user?.verificationCode}`);
            assert.equal(verifyResponse.status, 200, "User not verified");
            // signup with already verified credentials
            const newSignupResponse = await request(app)
                .post("/auth/signup")
                .send({
                    name: "DevsMachna",
                    email: "devsmachna@email.com",
                    password: "{StrongPassword1}"
                });
            assert.equal(newSignupResponse.status, 409, "User with same credential created");
        });
    });
    
    describe("Testing Login", () => {
        let idUser: string;
        let loggedUser: string;
        afterEach("Delete user after test", async () => {
            await User.findByIdAndDelete(idUser);
        });
        it("Testing 200 Successful login", async() => {
            // signup
            const signupResponse = await request(app)
                .post("/auth/signup")
                .send({
                    name: "DevsMachna",
                    email: "devsmachna@email.com",
                    password: "{StrongPassword1}"
                });
            assert.equal(signupResponse.status, 201, "User not created");
            assert.equal(typeof signupResponse.body.id, typeof "string", "User ID not a string");
            idUser = signupResponse.body.id;
            // verify
            const user = await User.findById(idUser);
            const verifyResponse = await request(app)
                .get(`/auth/verify/${user?.verificationCode}`);
            assert.equal(verifyResponse.status, 200, "User not verified");
            // login
            const loginResponse = await request(app)
                .post("/auth/login")
                .send({
                    email: "devsmachna@email.com",
                    password: "{StrongPassword1}"
                });
            assert.equal(loginResponse.status, 200, "Login failed");
            loggedUser = loginResponse.body.auth;
        });
        it("Testing 400 Invalid credential", async () => {
            // signup
            const signupResponse = await request(app)
                .post("/auth/signup")
                .send({
                    name: "DevsMachna",
                    email: "devsmachna@email.com",
                    password: "{StrongPassword1}"
                });
            assert.equal(signupResponse.status, 201, "User not created");
            assert.equal(typeof signupResponse.body.id, typeof "string", "User ID not a string");
            idUser = signupResponse.body.id;
            // verify
            const user = await User.findById(idUser);
            const verifyResponse = await request(app)
                .get(`/auth/verify/${user?.verificationCode}`);
            assert.equal(verifyResponse.status, 200, "User not verified");
            // login
            const loginResponse = await request(app)
                .post("/auth/login")
                .send({
                    email: "devsmachna@email.com",
                    password: "{WrongPassword1}"
                });
            assert.equal(loginResponse.status, 400, "Login success");
        });
        it("Testing 404 User not found when change name", async () => {
            const response = await request(app)
                .patch("/me")
                .set("Authorization", loggedUser)
                .send({
                    name: "Deus"
                });
            assert.equal(response.status, 404);
        });
        it("Testing 200 Successful change name", async () => {
            // signup
            const signupResponse = await request(app)
                .post("/auth/signup")
                .send({
                    name: "DevsMachna",
                    email: "devsmachna@email.com",
                    password: "{StrongPassword1}"
                });
            assert.equal(signupResponse.status, 201, "User not created");
            assert.equal(typeof signupResponse.body.id, typeof "string", "User ID not a string");
            idUser = signupResponse.body.id;
            // verify
            const user = await User.findById(idUser);
            const verifyResponse = await request(app)
                .get(`/auth/verify/${user?.verificationCode}`);
            assert.equal(verifyResponse.status, 200, "User not verified");
            // login
            const loginResponse = await request(app)
                .post("/auth/login")
                .send({
                    email: "devsmachna@email.com",
                    password: "{StrongPassword1}"
                });
            assert.equal(loginResponse.status, 200, "Login failed");
            // chnage name
            const patchResponse = await request(app)
                .patch("/auth/me")
                .set("Authorization", loginResponse.body.auth.trim())
                .send({
                    name: "Dev"
                });
            assert.equal(patchResponse.status, 200, "Name not changed");
        });
    });

    describe("Testing Reset password", () => {
        let idUser: string;
        afterEach("Delete user after test", async () => {
            await User.findByIdAndDelete(idUser);
        });
        it("Testing 200 Reset password", async () => {
            // signup
            const signupResponse = await request(app)
                .post("/auth/signup")
                .send({
                    name: "DevsMachna",
                    email: "devsmachna@email.com",
                    password: "{StrongPassword1}"
                });
            assert.equal(signupResponse.status, 201, "User not created");
            assert.equal(typeof signupResponse.body.id, typeof "string", "User ID not a string");
            idUser = signupResponse.body.id;
            // verify
            const user = await User.findById(idUser);
            const verifyResponse = await request(app)
                .get(`/auth/verify/${user?.verificationCode}`);
            assert.equal(verifyResponse.status, 200, "User not verified");
            // generate reset code
            const resetResponse = await request(app)
                .post("/auth/reset")
                .send({
                    email: "devsmachna@email.com"
                });
            assert.equal(resetResponse.status, 200, "Reset code not generated");
            const updateUser = await User.findById(idUser);
            const resetPasswordCode = updateUser?.resetPasswordCode;
            // change password
            const resetCodeResponse = await request(app)
                .patch(`/auth/reset/${resetPasswordCode}`)
                .set("Authorization", resetResponse.body.auth.trim())
                .send({
                    password: "{StrongPassword2}"
                });
            assert.equal(resetCodeResponse.status, 200, "Reset password failed");
        });
    })

})
