"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const uploadFiles_1 = require("../../helper/uploadFiles");
const s3Config_1 = require("../../config/s3Config");
const rrule_1 = require("rrule");
const date_fns_1 = require("date-fns");
const schedule_1 = require("../../helper/schedule");
const getUrl_1 = require("../../helper/getUrl");
class UserService {
    constructor(AuthRepository) {
        this.userData = null;
        this.UserRepository = AuthRepository;
        this.fileUploadService = new uploadFiles_1.awsFileUpload(new s3Config_1.AwsConfig());
    }
    async getDoctors(options) {
        try {
            const doctors = await this.UserRepository.getDoctors(options);
            if (!doctors) {
                return null;
            }
            return doctors;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDoctorDetails(id) {
        try {
            const doctor = await this.UserRepository.getDoctorDetails(id);
            if (!doctor) {
                return null;
            }
            return doctor;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getServices() {
        try {
            const services = await this.UserRepository.getServices();
            return services;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getUserProfile(id) {
        try {
            const user = await this.UserRepository.getUserProfile(id);
            if (!user) {
                return null;
            }
            return user;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async editUserProfile(id, data, file) {
        try {
            let image = undefined;
            console.log("Service - Received file:", file);
            if (file) {
                image = await this.fileUploadService.uploadUserProfileImage(id, file);
            }
            const updatedData = { ...data, image };
            const updatedUser = await this.UserRepository.editUserProfile(id, updatedData);
            if (updatedUser.image) {
                updatedUser.image = await (0, getUrl_1.getUrl)(updatedUser.image);
            }
            return updatedUser;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAppointmentDoctors(id) {
        try {
            const doctors = await this.UserRepository.getAppointmentDoctors(id);
            return doctors;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async chatImageUploads(id, file) {
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
            const savedMessage = await this.UserRepository.saveChatImageMessage(id, messageData);
            return {
                chatId: chatData.chatId,
                messageId: savedMessage._id,
                imageUrl: imageUrl,
                createdAt: savedMessage.createdAt,
            };
        }
        catch (error) {
            throw new Error(`Failed to upload chat image: ${error.message}`);
        }
    }
    async changePassword(id, oldPassword, newPassword) {
        try {
            const result = await this.UserRepository.changePassword(id, oldPassword, newPassword);
            return result;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAvailableSlots(id) {
        try {
            const schedules = await this.UserRepository.getScheduleForDoctor(id);
            const activeSchedules = schedules.filter((schedule) => !(0, schedule_1.isScheduleExpired)(schedule));
            if (!activeSchedules || activeSchedules.length === 0) {
                return [];
            }
            const sched = activeSchedules[0];
            const slots = [];
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
                if (!ruleStr)
                    ruleStr = sched.recurrenceRule;
                const ruleOptions = rrule_1.RRule.parseString(ruleStr);
                ruleOptions.dtstart = new Date(sched.startTime);
                const rule = new rrule_1.RRule(ruleOptions);
                const occurrences = rule.between(rangeStart, rangeEnd, true);
                occurrences.forEach((occurrence) => {
                    const occStart = new Date(occurrence);
                    const occEnd = new Date(occStart.getTime() + windowDuration);
                    let current = new Date(occStart);
                    while ((0, date_fns_1.isBefore)(current, occEnd)) {
                        slots.push({
                            slot: (0, date_fns_1.format)(current, "h:mma"),
                            datetime: new Date(current),
                        });
                        current = (0, date_fns_1.addMinutes)(current, sched.defaultSlotDuration);
                    }
                });
            }
            else {
                let current = new Date(sched.startTime);
                const end = new Date(sched.endTime);
                while ((0, date_fns_1.isBefore)(current, end)) {
                    slots.push({
                        slot: (0, date_fns_1.format)(current, "h:mma"),
                        datetime: new Date(current),
                    });
                    current = (0, date_fns_1.addMinutes)(current, sched.defaultSlotDuration);
                }
            }
            return slots;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
}
exports.UserService = UserService;
