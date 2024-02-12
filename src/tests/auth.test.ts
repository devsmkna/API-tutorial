import request from "supertest";
import app from "../index";
import { User } from "../models/User";
import assert from "assert";

describe("Testing Auth Signup", () => {
    let idUser: string;
    after("Delete user after test", () => {
        User.findByIdAndDelete(idUser);
    });
    it("Testing Signup", async () => {
        const response = await request(app)
            .post("/auth/signup")
            .send({
                name: "DevsMachna",
                email: "devsmachna@email.com",
                password: "{StrongPassword1}"
            });
        assert.equal(response.status, 201);
        assert.equal(typeof response.body.id, typeof "string");
        idUser = response.body.id;
    });
    it("Testing 400 Missing Email", async () => {
        const response = await request(app)
            .post("/auth/signup")
            .send({
                name: "DevsMachna",
                password: "{StrongPassword1}"
            });
        assert.equal(response.status, 400);
    });
    it("Testing 400 Missing Password", async () => {
        const response = await request(app)
            .post("/auth/signup")
            .send({
                name: "DevsMachna",
                email: "devsmachna@email.com"
            });
        assert.equal(response.status, 400);
    });
    it("Testing 400 Missing Name", async () => {
        const response = await request(app)
            .post("/auth/signup")
            .send({
                email: "devsmachna@email.com",
                password: "{StrongPassword1}"
            });
        assert.equal(response.status, 400);
    });
    it("Testing 400 Weak Password", async () => {
        const response = await request(app)
            .post("/auth/signup")
            .send({
                name: "DevsMachna",
                email: "devsmachna@email.com",
                password: "1234"
            });
        assert.equal(response.status, 400);
    });
    it("Testing 409 User already exist", async () => {
        const signupResponse = await request(app)
            .post("/auth/signup")
            .send({
                name: "DevsMachna",
                email: "devsmachna@email.com",
                password: "{StrongPassword1}"
            });
        assert.equal(signupResponse.status, 201);
        assert.equal(typeof signupResponse.body.id, typeof "string");
        idUser = signupResponse.body.id;
        const user = await User.findById(idUser);
        const verifyResponse = await request(app)
            .get(`/auth/verify/${user?.verificationCode}`);
        assert.equal(verifyResponse.status, 200);
        const newSignupResponse = await request(app)
            .post("/auth/signup")
            .send({
                name: "DevsMachna",
                email: "devsmachna@email.com",
                password: "{StrongPassword1}"
            });
        assert.equal(newSignupResponse.status, 409);
    });
})