"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const userModel_1 = __importDefault(require("../../model/userModel"));
class AuthRepository {
    async existUser(email) {
        try {
            console.log(".....");
            let existEmail = true;
            const emailExist = await userModel_1.default.findOne({ email });
            if (!emailExist) {
                existEmail = false;
            }
            return { existEmail };
        }
        catch (error) {
            console.error("Error checking if user exists:", error);
            throw new Error("Error checking if user exists");
        }
    }
    async createUser(userData) {
        try {
            console.log("user data", userData);
            userData.isVerified = true;
            const newUser = new userModel_1.default(userData);
            return await newUser.save();
        }
        catch (error) {
            console.log("Error in creating new User", error);
            throw new Error(`Error creating user : ${error.message}`);
        }
    }
    async userCheck(email) {
        try {
            const userData = await userModel_1.default.findOne({ email }).lean();
            if (!userData) {
                return null;
            }
            return {
                _id: userData._id,
                userId: userData.userId,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                DOB: userData.DOB,
                address: userData.address,
                isBlocked: userData.isBlocked,
                isVerified: userData.isVerified,
                image: userData.image || "",
                password: userData.password,
            };
        }
        catch (error) {
            console.error("Error in userCheck:", error);
            throw new Error("Database error occurred while checking user.");
        }
    }
    async handleGoogleLogin(userData) {
        try {
            const { email, name, googleId, isVerified, image } = userData;
            let user = await userModel_1.default.findOne({ email });
            let isNewUser = false;
            if (!user) {
                user = new userModel_1.default({
                    name,
                    email,
                    googleId,
                    isVerified,
                    image,
                    userId: userData.userId,
                });
                await user.save();
                isNewUser = true;
            }
            return { user, isNewUser };
        }
        catch (error) {
            console.error("Error in Google login repository:", error);
            throw new Error("DB error while handling Google login");
        }
    }
    async updatePassword(email, hashedPassword) {
        try {
            return await userModel_1.default.updateOne({ email }, { $set: { password: hashedPassword } });
        }
        catch (error) {
            console.error("Error updating password:", error);
            throw new Error("Error updating password");
        }
    }
    async logout(refreshToken) {
        try {
            console.log(refreshToken, "refresh token");
            return await userModel_1.default.updateOne({ refreshToken }, { $set: { refreshToken: "" } });
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
}
exports.AuthRepository = AuthRepository;
