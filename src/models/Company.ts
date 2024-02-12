import { Schema, model } from "mongoose";

type Company = {
    name: string,
    established: number,
    email?: string,
    address?: string,
    phone?: string,
    website?: string,
    description?: string
}

const companySchema = new Schema<Company>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    established: {
        type: Number,
        required: true
    },
    email: {
        type: String
    },
    address: {
        type: String
    },
    phone: {
        type: String
    },
    website: {
        type: String
    },
    description: {
        type: String
    }
});

export const Company = model<Company>("Companies", companySchema);