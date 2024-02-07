import { Schema, model } from "mongoose";

type User = {
    name: string,
    email: string,
    password: string,
    verifyed: boolean,
    token: string
}

const userSchema = new Schema<User>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    verifyed: {
        type: Boolean,
        default: false
    },
    token: {
        type: String
    }
});

export const User = model<User>("User", userSchema);