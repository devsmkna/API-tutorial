import { Schema, model } from "mongoose";

type User = {
    name: string,
    email: string,
    password: string,
    verifyed: boolean,
    verificationCode?: string,
    resetPasswordCode?: string,
    avatar?: string
}

const userSchema = new Schema<User>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    verifyed: {
        type: Boolean,
        required: true,
        default: false
    },
    verificationCode: {
        type: String
    },
    resetPasswordCode: {
        type: String
    },
    avatar: {
        type: String
    }
});

export const User = model<User>("Users", userSchema);