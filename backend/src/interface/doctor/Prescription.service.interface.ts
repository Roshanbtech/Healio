import { IPrescription } from "../../model/prescriptionModel";
export interface IPrescriptionService {
  addPrescription(data: Partial<IPrescription>): Promise<IPrescription>;
}
