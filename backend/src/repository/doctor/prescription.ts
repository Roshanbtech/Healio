import PrescriptionModel, { IPrescription } from "../../model/prescriptionModel";
import { IPrescriptionRepository } from "../../interface/doctor/Prescription.repository.interface";

export class PrescriptionRepository implements IPrescriptionRepository {
  async addPrescription(data: Partial<IPrescription>): Promise<IPrescription> {
    try {
      const prescription = new PrescriptionModel(data);
      return await prescription.save();
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
