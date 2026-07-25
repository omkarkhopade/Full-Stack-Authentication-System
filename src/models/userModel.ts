import { model, models, Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, "Please provide a username"],
            unique: true,
            trim: true,
            minlength: 2,
            maxlength: 40,
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            select: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        forgotPasswordToken: { type: String, select: false },
        forgotPasswordTokenExpiry: { type: Date, select: false },
        verifyToken: { type: String, select: false },
        verifyTokenExpiry: { type: Date, select: false },
    },
    { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

const User = models.User || model("User", userSchema);

export default User;
