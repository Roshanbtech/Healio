import { Express } from "express";
import {
  DoctorQualificationInput,
  doctorType,
  Schedule,
} from "../../interface/doctorInterface/Interface";
import { IDoctorService } from "../../interface/doctor/Auth.service.interface";
import { IDoctorRepository } from "../../interface/doctor/Auth.repository.interface";
import { Service } from "../../interface/doctorInterface/Interface";
// import { awsFileUpload } from "../../helper/uploadFiles";
// import { AwsConfig } from "../../config/s3Config";
import { CloudinaryFileUpload } from "../../helper/uploadFile"; 
import { CloudinaryConfig } from "../../config/cloudinaryConfig";
import { RRule, Weekday } from "rrule";
import { IAppointment } from "../../model/appointmentModel";
import { Iuser } from "../../model/userModel";
import { addMinutes, format, isBefore } from "date-fns";
import sendMail from "../../config/emailConfig";
import {
  GrowthChartData,
  DashboardStatsData,
  DashboardHomeData,
  DashboardStatsResponse,
} from "../../interface/doctorInterface/dashboardInterface";
// import { getUrl } from "../../helper/getUrl";
import { IDoctor } from "../../model/doctorModel";
import { ISchedule } from "../../model/slotModel";
import { Types } from "mongoose";

interface Slot {
  slot: string;
  datetime: Date;
}

export class DoctorService implements IDoctorService {
  private DoctorRepository: IDoctorRepository;

  private doctorData: doctorType | null = null;
  // private fileUploadService: awsFileUpload;
  private fileUploadService: CloudinaryFileUpload;

  constructor(DoctorRepository: IDoctorRepository) {
    this.DoctorRepository = DoctorRepository;
    // this.fileUploadService = new awsFileUpload(new AwsConfig());
    this.fileUploadService = new CloudinaryFileUpload(new CloudinaryConfig());
  }

  async getServices(): Promise<Service[]> {
    try {
      const services = await this.DoctorRepository.getServices();
      return services;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error in service layer";
      throw new Error(errorMessage);
    }
  }

  async addQualification(
    data: Record<string, string>,
    files: Express.Multer.File[]
  ): Promise<IDoctor | null> {
    const {
      hospital,
      degree,
      speciality,
      experience,
      country,
      achievements,
      doctorId,
    } = data;

    let uploadedCertificates: string[] = [];
    if (files && files.length > 0) {
      uploadedCertificates = await this.fileUploadService.uploadCertificates(
        doctorId,
        files
      );
    }
    const qualificationData: DoctorQualificationInput = {
      hospital,
      degree,
      speciality,
      experience,
      country,
      achievements,
      certificate: uploadedCertificates,
    };
    const result = await this.DoctorRepository.addQualification(
      qualificationData,
      doctorId
    );
    return result;
  }

  async getQualifications(id: string): Promise<IDoctor | null> {
    try {
      const qualification = await this.DoctorRepository.getQualifications(id);
      return qualification;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error in getQualifications (service)";
      throw new Error(errorMessage);
    }
  }

  async getDoctorProfile(id: string): Promise<Partial<IDoctor> | null> {
    try {
      const doctor = await this.DoctorRepository.getDoctorProfile(id);

      // if (doctor?.image) {
      //   doctor.image = await getUrl(doctor.image);
      // }

      return doctor;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error in getDoctorProfile (service)";
      throw new Error(errorMessage);
    }
  }

  // async editDoctorProfile(
  //   id: string,
  //   data: Partial<IDoctor>,
  //   file: Express.Multer.File
  // ): Promise<Partial<IDoctor> | null> {
  //   try {
  //     let image: string | undefined = undefined;
  //     console.log("Service - Received file:", file);

  //     if (file) {
  //       image = await this.fileUploadService.uploadDoctorProfileImage(id, file);
  //     }

  //     const updatedData = { ...data, image };
  //     const updatedDoctor = await this.DoctorRepository.editDoctorProfile(
  //       id,
  //       updatedData
  //     );
  //     // if (updatedDoctor?.image) {
  //     //   updatedDoctor.image = await getUrl(updatedDoctor.image);
  //     // }

  //     return updatedDoctor;
  //   } catch (error: unknown) {
  //     const errorMessage =
  //       error instanceof Error
  //         ? error.message
  //         : "Unknown error in editDoctorProfile";
  //     throw new Error(errorMessage);
  //   }
  // }

async editDoctorProfile(
  id: string,
  data: Partial<IDoctor>,
  file: Express.Multer.File
): Promise<Partial<IDoctor> | null> {
  try {
    const updatedData = { ...data };

    if (file) {
      const image = await this.fileUploadService.uploadDoctorProfileImage(id, file);
      console.log("Cloudinary URL received:", image);

      if (!image) {
        throw new Error("Image URL was not received from Cloudinary.");
      }

      updatedData.image = image;
    }

    const updatedDoctor = await this.DoctorRepository.editDoctorProfile(id, updatedData);
    console.log("Doctor profile updated successfully:", updatedDoctor);

    return updatedDoctor;
  } catch (error: unknown) {
    console.error("Full error object:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error in editDoctorProfile";

    console.error("Error in service layer:", errorMessage);
    throw new Error(errorMessage);
  }
}


  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      const result = await this.DoctorRepository.changePassword(
        id,
        oldPassword,
        newPassword
      );
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error in changePassword";
      throw new Error(errorMessage);
    }
  }

  async addSchedule(
    scheduleData: Partial<ISchedule> & {
      recurrenceDays?: string[];
      recurrenceUntil?: string;
    }
  ): Promise<ISchedule> {
    try {
      if (scheduleData.isRecurring && !scheduleData.recurrenceRule) {
        if (
          !scheduleData.recurrenceDays ||
          scheduleData.recurrenceDays.length === 0 ||
          !scheduleData.recurrenceUntil
        ) {
          throw new Error(
            "Missing recurrence details: recurrenceDays and recurrenceUntil are required for recurring schedules."
          );
        }

        const weekdays: Weekday[] = scheduleData.recurrenceDays.map(
          (day: string) => {
            const weekday = RRule[day as keyof typeof RRule];
            if (!(weekday instanceof Weekday)) {
              throw new Error(`Invalid recurrence day: ${day}`);
            }
            return weekday;
          }
        );

        const dtstart = new Date(scheduleData.startTime!);
        const until = new Date(scheduleData.recurrenceUntil);

        const rule = new RRule({
          freq: RRule.WEEKLY,
          byweekday: weekdays,
          dtstart,
          until,
        });

        scheduleData.recurrenceRule = rule.toString();
      }

      if (scheduleData.isRecurring) {
        if (!scheduleData.doctor) {
          throw new Error("Doctor ID is required.");
        }
      
        const doctorId = scheduleData.doctor instanceof Types.ObjectId
          ? scheduleData.doctor.toString()
          : scheduleData.doctor;
      
        const existingRecurring = await this.DoctorRepository.findRecurringScheduleByDoctor(doctorId);
      
        if (existingRecurring) {
          throw new Error("A recurring schedule already exists for this doctor. Cannot add another recurring schedule.");
        }
      }
      
      

      const createdSchedule = await this.DoctorRepository.addSchedule(
        scheduleData
      );
      return createdSchedule;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to add schedule.";
      throw new Error(message);
    }
  }

  async getSchedule(id: string): Promise<{
    status: boolean;
    message: string;
    data?: ISchedule[];
  }> {
    try {
      const schedules = await this.DoctorRepository.getSchedule(id);
  
      if (!schedules || schedules.length === 0) {
        return {
          status: false,
          message: "No active schedules found",
        };
      }
  
      return {
        status: true,
        message: "Schedule fetched successfully",
        data: schedules,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong in service";
      throw new Error(errorMessage);
    }
  }
  

  async getUsers(): Promise<any> {
    try {
      const result = await this.DoctorRepository.getUsers();
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error in getUsers";
      throw new Error(errorMessage);
    }
  }

  async getAppointmentUsers(id: string): Promise<Iuser[]> {
    try {
      const result = await this.DoctorRepository.getAppointmentUsers(id);
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error in getAppointmentUsers";
      throw new Error(errorMessage);
    }
  }

  async chatImageUploads(id: string, file: Express.Multer.File): Promise<any> {
    try {
      if (!file) {
        throw new Error("No file provided");
      }

      const chatData = await this.DoctorRepository.uploadChatImage(id, file);

      const imageUrl = await this.fileUploadService.uploadChatImage(id, file);

      const messageData = {
        ...chatData.newMessage,
        message: imageUrl,
      };

      const savedMessage = await this.DoctorRepository.saveChatImageMessage(
        id,
        messageData
      );

      return {
        chatId: chatData.chatId,
        messageId: savedMessage._id,
        imageUrl: imageUrl,
        createdAt: savedMessage.createdAt,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error in chatImageUploads";
      throw new Error(errorMessage);
    }
  }

  //get appointments related to a particular doctor
  async getAppointments(id: string): Promise<any> {
    try {
      const appointments = await this.DoctorRepository.getAppointments(id);
      return appointments;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error in getAppointments";
      throw new Error(errorMessage);
    }
  }

  //doctor accept appointments....
  async acceptAppointment(id: string): Promise<IAppointment | null> {
    try {
      const accepted = await this.DoctorRepository.acceptAppointment(id);
      return accepted;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to accept appointment: ${error.message}`);
      }
      throw new Error(`Failed to accept appointment: ${error}`);
    }
  }

  async completeAppointment(id: string): Promise<IAppointment | null> {
    try {
      const completed = await this.DoctorRepository.completeAppointment(id);
      return completed;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to complete appointment: ${error.message}`);
      }
      throw new Error(`Failed to complete appointment: ${error}`);
    }
  }

  async rescheduleAppointment(
    id: string,
    date: string,
    time: string,
    reason: string
  ): Promise<IAppointment | null> {
    try {
      const rescheduled = await this.DoctorRepository.rescheduleAppointment(
        id,
        date,
        time,
        reason
      );
      await sendMail(
        (rescheduled?.patientId as any)?.email,
        "Appointment Rescheduled",
        `Your appointment has been rescheduled to ${date} at ${time}. Reason: ${reason}.`
      );
      return rescheduled;
    } catch (error: unknown) {
      throw new Error(`Failed to reschedule appointment: ${error}`);
    }
  }

  async getDoctorAvailableSlots(id: string): Promise<Slot[]> {
    try {
      const schedules: Schedule[] =
        await this.DoctorRepository.getDoctorAvailableSlots(id);
      if (!schedules || schedules.length === 0) {
        return [];
      }
      const sched = schedules[0];
      const slots: Slot[] = [];
      const windowDuration =
        new Date(sched.endTime).getTime() - new Date(sched.startTime).getTime();

      if (sched.isRecurring && sched.recurrenceRule) {
        const rangeStart = new Date();
        const rangeEnd = new Date();
        rangeEnd.setDate(rangeEnd.getDate() + 14);

        const lines = sched.recurrenceRule.split("\n");
        let ruleStr = "";
        for (const line of lines) {
          if (line.startsWith("RRULE:")) {
            ruleStr = line.substring(6);
            break;
          }
        }
        if (!ruleStr) ruleStr = sched.recurrenceRule;

        const ruleOptions = RRule.parseString(ruleStr);
        ruleOptions.dtstart = new Date(sched.startTime);
        const rule = new RRule(ruleOptions);
        const occurrences = rule.between(rangeStart, rangeEnd, true);
        occurrences.forEach((occurrence: Date) => {
          const occStart = new Date(occurrence);
          const occEnd = new Date(occStart.getTime() + windowDuration);
          let current = new Date(occStart);
          while (isBefore(current, occEnd)) {
            slots.push({
              slot: format(current, "h:mma"),
              datetime: new Date(current),
            });
            current = addMinutes(current, sched.defaultSlotDuration);
          }
        });
      } else {
        let current = new Date(sched.startTime);
        const end = new Date(sched.endTime);
        while (isBefore(current, end)) {
          slots.push({
            slot: format(current, "h:mma"),
            datetime: new Date(current),
          });
          current = addMinutes(current, sched.defaultSlotDuration);
        }
      }
      return slots;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to get available slots: ${error.message}`);
      }
      throw new Error(
        "An unexpected error occurred while getting available slots."
      );
    }
  }

  async fetchDashboardStats(
    doctorId: string
  ): Promise<DashboardStatsResponse | null> {
    try {
      return await this.DoctorRepository.getDashboardStats(doctorId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
      }
      throw new Error(
        "An unexpected error occurred while fetching dashboard stats."
      );
    }
  }

  async fetchGrowthData(
    doctorId: string,
    timeRange: "daily" | "weekly" | "monthly" | "yearly",
    dateParam?: string
  ): Promise<any> {
    try {
      const growthData = await this.DoctorRepository.getGrowthData(
        doctorId,
        timeRange,
        dateParam
      );
      return growthData;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch growth data: ${error.message}`);
      }
      throw new Error(
        "An unexpected error occurred while fetching growth data."
      );
    }
  }

  async getDashboardHome(doctorId: string): Promise<DashboardHomeData> {
    try {
      const data = await this.DoctorRepository.getDashboardHome(doctorId);

      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to fetch dashboard home data: ${error.message}`
        );
      }
      throw new Error(
        "An unexpected error occurred while fetching dashboard home data."
      );
    }
  }
}
