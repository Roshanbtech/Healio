"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorService = void 0;
const uploadFiles_1 = require("../../helper/uploadFiles");
const s3Config_1 = require("../../config/s3Config");
const rrule_1 = require("rrule");
const date_fns_1 = require("date-fns");
const emailConfig_1 = __importDefault(require("../../config/emailConfig"));
const getUrl_1 = require("../../helper/getUrl");
const mongoose_1 = require("mongoose");
class DoctorService {
    constructor(DoctorRepository) {
        this.doctorData = null;
        this.DoctorRepository = DoctorRepository;
        this.fileUploadService = new uploadFiles_1.awsFileUpload(new s3Config_1.AwsConfig());
    }
    async getServices() {
        try {
            const services = await this.DoctorRepository.getServices();
            return services;
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Unknown error in service layer";
            throw new Error(errorMessage);
        }
    }
    async addQualification(data, files) {
        const { hospital, degree, speciality, experience, country, achievements, doctorId, } = data;
        let uploadedCertificates = [];
        if (files && files.length > 0) {
            uploadedCertificates = await this.fileUploadService.uploadCertificates(doctorId, files);
        }
        const qualificationData = {
            hospital,
            degree,
            speciality,
            experience,
            country,
            achievements,
            certificate: uploadedCertificates,
        };
        const result = await this.DoctorRepository.addQualification(qualificationData, doctorId);
        return result;
    }
    async getQualifications(id) {
        try {
            const qualification = await this.DoctorRepository.getQualifications(id);
            return qualification;
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Unknown error in getQualifications (service)";
            throw new Error(errorMessage);
        }
    }
    async getDoctorProfile(id) {
        try {
            const doctor = await this.DoctorRepository.getDoctorProfile(id);
            if (doctor?.image) {
                doctor.image = await (0, getUrl_1.getUrl)(doctor.image);
            }
            return doctor;
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Unknown error in getDoctorProfile (service)";
            throw new Error(errorMessage);
        }
    }
    async editDoctorProfile(id, data, file) {
        try {
            let image = undefined;
            console.log("Service - Received file:", file);
            if (file) {
                image = await this.fileUploadService.uploadDoctorProfileImage(id, file);
            }
            const updatedData = { ...data, image };
            const updatedDoctor = await this.DoctorRepository.editDoctorProfile(id, updatedData);
            if (updatedDoctor?.image) {
                updatedDoctor.image = await (0, getUrl_1.getUrl)(updatedDoctor.image);
            }
            return updatedDoctor;
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Unknown error in editDoctorProfile";
            throw new Error(errorMessage);
        }
    }
    async changePassword(id, oldPassword, newPassword) {
        try {
            const result = await this.DoctorRepository.changePassword(id, oldPassword, newPassword);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Unknown error in changePassword";
            throw new Error(errorMessage);
        }
    }
    async addSchedule(scheduleData) {
        try {
            if (scheduleData.isRecurring && !scheduleData.recurrenceRule) {
                if (!scheduleData.recurrenceDays ||
                    scheduleData.recurrenceDays.length === 0 ||
                    !scheduleData.recurrenceUntil) {
                    throw new Error("Missing recurrence details: recurrenceDays and recurrenceUntil are required for recurring schedules.");
                }
                const weekdays = scheduleData.recurrenceDays.map((day) => {
                    const weekday = rrule_1.RRule[day];
                    if (!(weekday instanceof rrule_1.Weekday)) {
                        throw new Error(`Invalid recurrence day: ${day}`);
                    }
                    return weekday;
                });
                const dtstart = new Date(scheduleData.startTime);
                const until = new Date(scheduleData.recurrenceUntil);
                const rule = new rrule_1.RRule({
                    freq: rrule_1.RRule.WEEKLY,
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
                const doctorId = scheduleData.doctor instanceof mongoose_1.Types.ObjectId
                    ? scheduleData.doctor.toString()
                    : scheduleData.doctor;
                const existingRecurring = await this.DoctorRepository.findRecurringScheduleByDoctor(doctorId);
                if (existingRecurring) {
                    throw new Error("A recurring schedule already exists for this doctor. Cannot add another recurring schedule.");
                }
            }
            const createdSchedule = await this.DoctorRepository.addSchedule(scheduleData);
            return createdSchedule;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to add schedule.";
            throw new Error(message);
        }
    }
    async getSchedule(id) {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Something went wrong in service";
            throw new Error(errorMessage);
        }
    }
    async getUsers() {
        try {
            const result = await this.DoctorRepository.getUsers();
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error in getUsers";
            throw new Error(errorMessage);
        }
    }
    async getAppointmentUsers(id) {
        try {
            const result = await this.DoctorRepository.getAppointmentUsers(id);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Unknown error in getAppointmentUsers";
            throw new Error(errorMessage);
        }
    }
    async chatImageUploads(id, file) {
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
            const savedMessage = await this.DoctorRepository.saveChatImageMessage(id, messageData);
            return {
                chatId: chatData.chatId,
                messageId: savedMessage._id,
                imageUrl: imageUrl,
                createdAt: savedMessage.createdAt,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Unknown error in chatImageUploads";
            throw new Error(errorMessage);
        }
    }
    //get appointments related to a particular doctor
    async getAppointments(id) {
        try {
            const appointments = await this.DoctorRepository.getAppointments(id);
            return appointments;
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Unknown error in getAppointments";
            throw new Error(errorMessage);
        }
    }
    //doctor accept appointments....
    async acceptAppointment(id) {
        try {
            const accepted = await this.DoctorRepository.acceptAppointment(id);
            return accepted;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to accept appointment: ${error.message}`);
            }
            throw new Error(`Failed to accept appointment: ${error}`);
        }
    }
    async completeAppointment(id) {
        try {
            const completed = await this.DoctorRepository.completeAppointment(id);
            return completed;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to complete appointment: ${error.message}`);
            }
            throw new Error(`Failed to complete appointment: ${error}`);
        }
    }
    async rescheduleAppointment(id, date, time, reason) {
        try {
            const rescheduled = await this.DoctorRepository.rescheduleAppointment(id, date, time, reason);
            await (0, emailConfig_1.default)(rescheduled?.patientId?.email, "Appointment Rescheduled", `Your appointment has been rescheduled to ${date} at ${time}. Reason: ${reason}.`);
            return rescheduled;
        }
        catch (error) {
            throw new Error(`Failed to reschedule appointment: ${error}`);
        }
    }
    async getDoctorAvailableSlots(id) {
        try {
            const schedules = await this.DoctorRepository.getDoctorAvailableSlots(id);
            if (!schedules || schedules.length === 0) {
                return [];
            }
            const sched = schedules[0];
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
            if (error instanceof Error) {
                throw new Error(`Failed to get available slots: ${error.message}`);
            }
            throw new Error("An unexpected error occurred while getting available slots.");
        }
    }
    async fetchDashboardStats(doctorId) {
        try {
            return await this.DoctorRepository.getDashboardStats(doctorId);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
            }
            throw new Error("An unexpected error occurred while fetching dashboard stats.");
        }
    }
    async fetchGrowthData(doctorId, timeRange, dateParam) {
        try {
            const growthData = await this.DoctorRepository.getGrowthData(doctorId, timeRange, dateParam);
            return growthData;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch growth data: ${error.message}`);
            }
            throw new Error("An unexpected error occurred while fetching growth data.");
        }
    }
    async getDashboardHome(doctorId) {
        try {
            const data = await this.DoctorRepository.getDashboardHome(doctorId);
            return data;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch dashboard home data: ${error.message}`);
            }
            throw new Error("An unexpected error occurred while fetching dashboard home data.");
        }
    }
}
exports.DoctorService = DoctorService;
