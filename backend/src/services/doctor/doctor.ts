import {
  doctorType,
  Schedule,
} from "../../interface/doctorInterface/Interface";
import { IDoctorService } from "../../interface/doctor/Auth.service.interface";
import { IDoctorRepository } from "../../interface/doctor/Auth.repository.interface";
import { Service } from "../../interface/doctorInterface/Interface";
import { awsFileUpload } from "../../helper/uploadFiles";
import { AwsConfig } from "../../config/s3Config";
import { RRule, Weekday } from "rrule";
import { IAppointment } from "../../model/appointmentModel";
import { Iuser } from "../../model/userModel";
import { addMinutes, format, isBefore } from "date-fns";
import sendMail from "../../config/emailConfig";
import { GrowthChartData,DashboardStatsData, DashboardHomeData, DashboardStatsResponse } from "../../interface/doctorInterface/dashboardInterface";
import { getUrl } from "../../helper/getUrl";

interface Slot {
  slot: string;
  datetime: Date;
}

export class DoctorService implements IDoctorService {
  private DoctorRepository: IDoctorRepository;

  private doctorData: doctorType | null = null;
  private fileUploadService: awsFileUpload;

  constructor(DoctorRepository: IDoctorRepository) {
    this.DoctorRepository = DoctorRepository;
    this.fileUploadService = new awsFileUpload(new AwsConfig());
  }

  async getServices(): Promise<Service[]> {
    try {
      const services = await this.DoctorRepository.getServices();
      return services;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addQualification(
    data: any,
    files: Express.Multer.File[]
  ): Promise<any> {
    const {
      hospital,
      degree,
      speciality,
      experience,
      country,
      achievements,
      doctorId,
    } = data;
    console.log("1", data);

    console.log("2");
    // File Upload Handling
    let uploadedCertificates: string[] = [];
    if (files && files.length > 0) {
      uploadedCertificates = await this.fileUploadService.uploadCertificates(
        doctorId,
        files
      );
    }
    console.log("3");
    const qualificationData = {
      hospital,
      degree,
      speciality,
      experience,
      country,
      achievements,
      certificate: uploadedCertificates,
    };
    console.log("4");
    // Pass to repository for update
    const result = await this.DoctorRepository.addQualification(
      qualificationData,
      doctorId
    );
    console.log("5");
    return result;
  }

  async getQualifications(id: string): Promise<any> {
    try {
      const qualification = await this.DoctorRepository.getQualifications(id);
      return qualification;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getDoctorProfile(id: string): Promise<any> {
    try {
      const doctor = await this.DoctorRepository.getDoctorProfile(id);
      if(doctor.image){
        doctor.image = await getUrl(doctor.image);
      }
      return doctor;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async editDoctorProfile(
    id: string,
    data: any,
    file: Express.Multer.File
  ): Promise<any> {
    try {
      let image: string | undefined = undefined;
      console.log("Service - Received file:", file);

      if (file) {
        image = await this.fileUploadService.uploadDoctorProfileImage(id, file);
      }

      const updatedData = { ...data, image };
      const updatedDoctor = await this.DoctorRepository.editDoctorProfile(
        id,
        updatedData
      );
      if(updatedDoctor.image){
        updatedDoctor.image = await getUrl(updatedDoctor.image);
      }

      return updatedDoctor;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async changePassword(
    id: string,
    oldPassword: any,
    newPassword: any
  ): Promise<any> {
    try {
      const result = await this.DoctorRepository.changePassword(
        id,
        oldPassword,
        newPassword
      );
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addSchedule(scheduleData: Schedule): Promise<any> {
    try {
      if (scheduleData.isRecurring) {
        const extra = scheduleData as any;
        if (!scheduleData.recurrenceRule) {
          if (
            !extra.recurrenceDays ||
            extra.recurrenceDays.length === 0 ||
            !extra.recurrenceUntil
          ) {
            throw new Error(
              "Missing recurrence details: recurrenceDays and recurrenceUntil are required for recurring schedules."
            );
          }
          const weekdays: Weekday[] = extra.recurrenceDays.map(
            (day: string) => RRule[day as keyof typeof RRule]
          );
          const dtstart = new Date(scheduleData.startTime);
          const until = new Date(extra.recurrenceUntil);
          const rule = new RRule({
            freq: RRule.WEEKLY,
            byweekday: weekdays,
            dtstart,
            until,
          });
          scheduleData.recurrenceRule = rule.toString();
        }
      }
      const result = await this.DoctorRepository.addSchedule(scheduleData);
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getSchedule(id: string): Promise<any> {
    try {
      const result = await this.DoctorRepository.getSchedule(id);
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getUsers(): Promise<any> {
    try {
      const result = await this.DoctorRepository.getUsers();
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getAppointmentUsers(id: string): Promise<Iuser[]>{
    try{
      const result = await this.DoctorRepository.getAppointmentUsers(id);
      return result;
    }catch(error: any){
      throw new Error(error.message);
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
    } catch (error: any) {
      throw new Error(`Failed to upload chat image: ${error.message}`);
    }
  }

  //get appointments related to a particular doctor
  async getAppointments(id: string): Promise<any>{
    try{
      const appointments = await this.DoctorRepository.getAppointments(id);
      return appointments;
    }catch(error: any){
      throw new Error(`Failed to get appointments: ${error.message}`);
    }
  }

  //doctor accept appointments....
  async acceptAppointment(id: string): Promise<IAppointment | null> {
      try{
       const accepted = await this.DoctorRepository.acceptAppointment(id);
       return accepted;
      }catch(error: any){
        throw new Error(`Failed to accept appointment: ${error.message}`);
      }
  }

  async completeAppointment(id:string): Promise<IAppointment | null> {
    try{
      const completed = await this.DoctorRepository.completeAppointment(id);
      return completed;
    }catch(error: any){
      throw new Error(`Failed to complete appointment: ${error.message}`);
    }
  }

  async rescheduleAppointment(id: string, date: string, time: string, reason: string): Promise<IAppointment | null>{
    try{
      const rescheduled = await this.DoctorRepository.rescheduleAppointment(id, date, time, reason);
      await sendMail((rescheduled?.patientId as any)?.email, "Appointment Rescheduled", `Your appointment has been rescheduled to ${date} at ${time}. Reason: ${reason}.`);
      return rescheduled;
    }catch(error: any){
      throw new Error(`Failed to reschedule appointment: ${error.message}`);
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
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  
    async fetchDashboardStats(doctorId: string): Promise<DashboardStatsResponse | null> {
      try {
        return await this.DoctorRepository.getDashboardStats(doctorId);
      } catch (error: any) {
        throw new Error(error.message);
      }
    }

    async fetchGrowthData(
      doctorId: string,
      timeRange: "daily" | "weekly" | "monthly" | "yearly",
      dateParam?: string
    ): Promise<any> {
      try {
        const growthData = await this.DoctorRepository.getGrowthData(doctorId, timeRange, dateParam);
        return growthData;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  
    async getDashboardHome(doctorId: string): Promise<DashboardHomeData> {
      try {
        const data = await this.DoctorRepository.getDashboardHome(doctorId);
        
        return data;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
    

}
