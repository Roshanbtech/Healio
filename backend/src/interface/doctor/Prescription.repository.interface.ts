import { IPrescription } from "../../model/prescriptionModel";

export interface IPrescriptionRepository {
  addPrescription(data: Partial<IPrescription>): Promise<IPrescription>;
}
