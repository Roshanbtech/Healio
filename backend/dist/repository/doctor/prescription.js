"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionRepository = void 0;
const prescriptionModel_1 = __importDefault(require("../../model/prescriptionModel"));
class PrescriptionRepository {
    async addPrescription(data) {
        try {
            const prescription = new prescriptionModel_1.default(data);
            return await prescription.save();
        }
        catch (error) {
            throw new Error(error);
        }
    }
}
exports.PrescriptionRepository = PrescriptionRepository;
