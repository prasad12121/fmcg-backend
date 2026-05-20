import mongoose, { InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["Distributor", "outlet"],
      default: "outlet",
    },
    authCode: {
      type: String,
      select: false,
      default: null,
    },
    authCodeExpiry: {
      type: Date,
      select: false,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        const safeRet = ret as Record<string, unknown>;
        delete safeRet.passwordHash;
        delete safeRet.authCode;
        delete safeRet.authCodeExpiry;
        return safeRet;
      },
    },
  }
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

const User = mongoose.model("User", userSchema);

export default User;
