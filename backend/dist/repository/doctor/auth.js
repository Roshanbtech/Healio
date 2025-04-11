"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const doctorModel_1 = __importDefault(require("../../model/doctorModel"));
class AuthRepository {
    async existDoctor(email) {
        try {
            let existEmail = true;
            const emailExist = await doctorModel_1.default.findOne({ email: email });
            if (!emailExist) {
                existEmail = false;
            }
            return { existEmail };
        }
        catch (error) {
            console.error("Error checking if doctor exists:", error);
            throw new Error("Error checking if doctor exists");
        }
    }
    async createDoctor(doctorData) {
        try {
            doctorData.isVerified = true;
            const newDoctor = new doctorModel_1.default(doctorData);
            return (await newDoctor.save());
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error creating doctor: ${error.message}`);
            }
            throw new Error("Error creating doctor");
        }
    }
    async updatePassword(email, hashedPassword) {
        try {
            return await doctorModel_1.default.updateOne({ email }, { $set: { password: hashedPassword } });
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Error updating password:", error.message);
                throw new Error("Error updating password");
            }
            else {
                console.error("Unexpected error updating password:", error);
                throw new Error("Unknown error while updating password");
            }
        }
    }
    async doctorCheck(email) {
        try {
            const doctorData = await doctorModel_1.default.findOne({ email: email }).lean();
            if (!doctorData) {
                return null;
            }
            return {
                _id: doctorData._id,
                name: doctorData.name,
                email: doctorData.email,
                password: doctorData.password,
                phone: doctorData.phone,
                isBlocked: doctorData.isBlocked,
                isVerified: doctorData.isVerified,
                image: doctorData.image || "",
                isDoctor: doctorData.isDoctor,
                docStatus: doctorData.docStatus,
            };
        }
        catch (error) {
            throw new Error("Error checking doctor");
        }
    }
    async handleGoogleLogin(doctorData) {
        try {
            const { email, name, googleId, isVerified, image } = doctorData;
            let doctor = await doctorModel_1.default.findOne({ email });
            let isNewDoctor = false;
            if (!doctor) {
                doctor = new doctorModel_1.default({
                    name,
                    email,
                    googleId,
                    isVerified,
                    image,
                });
                await doctor.save();
                isNewDoctor = true;
            }
            return { doctor, isNewDoctor };
        }
        catch (error) {
            console.error("Error in Google login repository:", error);
            throw new Error("DB error while handling Google login");
        }
    }
    async logout(refreshToken) {
        try {
            const result = await doctorModel_1.default.updateOne({ refreshToken }, { $set: { refreshToken: "" } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error("Repository logout error: " + error.message);
            }
            throw new Error("Unexpected repository error");
        }
    }
}
exports.AuthRepository = AuthRepository;
