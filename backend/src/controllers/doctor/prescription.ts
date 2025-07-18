import { Request, Response, NextFunction,Express } from "express";
import HTTP_statusCode from "../../enums/httpStatusCode";
import { IPrescriptionService } from "../../interface/doctor/Prescription.service.interface";

export class PrescriptionController {
  private prescriptionService: IPrescriptionService;
  constructor(prescriptionServiceInstance: IPrescriptionService) {
    this.prescriptionService = prescriptionServiceInstance;
  }

  async addPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointmentId = req.params.appointmentId;
      const {
        patientId,
        doctorId,
        diagnosis,
        advice,
        followUpDate,
        doctorNotes,
      } = req.body;

      let medicines = req.body.medicines;
      let labTests = req.body.labTests;

      if (typeof medicines === "string") {
        try {
          medicines = JSON.parse(medicines);
        } catch {
          res.status(HTTP_statusCode.BadRequest).json({
            status: false,
            data: null,
            message: "Invalid medicines format",
          });
          return;
        }
      }

      if (typeof labTests === "string") {
        try {
          labTests = JSON.parse(labTests);
        } catch {
          res.status(HTTP_statusCode.BadRequest).json({
            status: false,
            data: null,
            message: "Invalid labTests format",
          });
          return;
        }
      }

      if (!req.file) {
        res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          data: null,
          message: "Prescription image is required",
        });
        return;
      }


      const signatureFile = req.file as Express.Multer.File;

      const prescriptionData = {
        appointmentId,
        patientId,
        doctorId,
        diagnosis,
        medicines,
        labTests,
        advice,
        followUpDate,
        doctorNotes,
        signature: signatureFile as unknown as File,
      };

      const prescription = await this.prescriptionService.addPrescription(prescriptionData);
      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { prescription },
        message: "Prescription added successfully",
      });
    } catch (error: unknown) {
      next(error);
    }
  }
}
