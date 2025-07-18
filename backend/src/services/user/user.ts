import { Express } from "express";
import {
  userType,
  DoctorDetails,
} from "../../interface/userInterface/interface";
import { IUserService } from "../../interface/user/User.service.interface";
import { IUserRepository } from "../../interface/user/User.repository.interface";
// import { awsFileUpload } from "../../helper/uploadFiles";
// import { AwsConfig } from "../../config/s3Config";
import { CloudinaryFileUpload } from "../../helper/uploadFile"; 
import { CloudinaryConfig } from "../../config/cloudinaryConfig";
import { PaginationOptions } from "../../helper/pagination";
import { RRule } from "rrule";
import { format, addMinutes, isBefore } from "date-fns";
import { Schedule } from "../../interface/doctorInterface/Interface";
import { IDoctor } from "../../model/doctorModel";
import { ISchedule } from "../../model/slotModel";
import { isScheduleExpired } from "../../helper/schedule";
// import { getUrl } from "../../helper/getUrl";
interface Slot {
  slot: string;
  datetime: string;
}
export class UserService implements IUserService {
  private UserRepository: IUserRepository;

  private userData: userType | null = null;
  // private fileUploadService: awsFileUpload;
  private fileUploadService: CloudinaryFileUpload;
  constructor(AuthRepository: IUserRepository) {
    this.UserRepository = AuthRepository;
    // this.fileUploadService = new awsFileUpload(new AwsConfig());
    this.fileUploadService = new CloudinaryFileUpload(new CloudinaryConfig());
  }

  async getDoctors(options: PaginationOptions): Promise<any> {
    try {
      const doctors = await this.UserRepository.getDoctors(options);
      if (!doctors) {
        return null;
      }
      
      return doctors;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getDoctorDetails(id: string): Promise<any> {
    try {
      const doctor = await this.UserRepository.getDoctorDetails(id);
      if (!doctor) {
        return null;
      }
      return doctor;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getServices(): Promise<any> {
    try {
      const services = await this.UserRepository.getServices();
      return services;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getUserProfile(id: string): Promise<any> {
    try {
      const user = await this.UserRepository.getUserProfile(id);
      if (!user) {
        return null;
      }
     
      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async editUserProfile(
    id: string,
    data: any,
    file: Express.Multer.File
  ): Promise<any> {
    try {
      let image: string | undefined = undefined;
      console.log("Service - Received file:", file);

      if (file) {
        image = await this.fileUploadService.uploadUserProfileImage(id, file);
      }

      const updatedData = { ...data, image };
      const updatedUser = await this.UserRepository.editUserProfile(
        id,
        updatedData
      );

      // if (updatedUser.image) {
      //   updatedUser.image = await getUrl(updatedUser.image);
      // }

      return updatedUser;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getAppointmentDoctors(id: string): Promise<IDoctor[]>{
    try{
      const doctors = await this.UserRepository.getAppointmentDoctors(id);
      return doctors;
    }catch(error: any){
      throw new Error(error.message);
    }
  }
  

  async chatImageUploads(id: string, file: Express.Multer.File): Promise<any> {
    try {
      if (!file) {
        throw new Error("No file provided");
      }

      const chatData = await this.UserRepository.uploadChatImage(id, file);

      const imageUrl = await this.fileUploadService.uploadChatImage(id, file);

      const messageData = {
        ...chatData.newMessage,
        message: imageUrl,
      };

      const savedMessage = await this.UserRepository.saveChatImageMessage(
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

  async changePassword(
    id: string,
    oldPassword: any,
    newPassword: any
  ): Promise<any> {
    try {
      const result = await this.UserRepository.changePassword(
        id,
        oldPassword,
        newPassword
      );
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getAvailableSlots(id: string): Promise<Slot[]> {
    try {
      const schedules: Schedule[] = await this.UserRepository.getScheduleForDoctor(id);
      const activeSchedules = schedules.filter(
        (schedule) => !isScheduleExpired(schedule as unknown as ISchedule)
      );
      if (!activeSchedules || activeSchedules.length === 0) {
        return [];
      }
      const sched = activeSchedules[0];
      const slots: Slot[] = [];
      const windowDuration = new Date(sched.endTime).getTime() - new Date(sched.startTime).getTime();
    
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
              datetime: new Date(current).toString()
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
            datetime: new Date(current).toISOString()
          });
          current = addMinutes(current, sched.defaultSlotDuration);
        }
      }
      return slots;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
