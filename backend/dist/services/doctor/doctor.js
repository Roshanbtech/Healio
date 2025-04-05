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
            throw new Error(error.message);
        }
    }
    async addQualification(data, files) {
        const { hospital, degree, speciality, experience, country, achievements, doctorId, } = data;
        console.log("1", data);
        console.log("2");
        // File Upload Handling
        let uploadedCertificates = [];
        if (files && files.length > 0) {
            uploadedCertificates = await this.fileUploadService.uploadCertificates(doctorId, files);
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
        const result = await this.DoctorRepository.addQualification(qualificationData, doctorId);
        console.log("5");
        return result;
    }
    async getQualifications(id) {
        try {
            const qualification = await this.DoctorRepository.getQualifications(id);
            return qualification;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDoctorProfile(id) {
        try {
            const doctor = await this.DoctorRepository.getDoctorProfile(id);
            if (doctor.image) {
                doctor.image = await (0, getUrl_1.getUrl)(doctor.image);
            }
            return doctor;
        }
        catch (error) {
            throw new Error(error.message);
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
            if (updatedDoctor.image) {
                updatedDoctor.image = await (0, getUrl_1.getUrl)(updatedDoctor.image);
            }
            return updatedDoctor;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async changePassword(id, oldPassword, newPassword) {
        try {
            const result = await this.DoctorRepository.changePassword(id, oldPassword, newPassword);
            return result;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async addSchedule(scheduleData) {
        try {
            if (scheduleData.isRecurring) {
                const extra = scheduleData;
                if (!scheduleData.recurrenceRule) {
                    if (!extra.recurrenceDays ||
                        extra.recurrenceDays.length === 0 ||
                        !extra.recurrenceUntil) {
                        throw new Error("Missing recurrence details: recurrenceDays and recurrenceUntil are required for recurring schedules.");
                    }
                    const weekdays = extra.recurrenceDays.map((day) => rrule_1.RRule[day]);
                    const dtstart = new Date(scheduleData.startTime);
                    const until = new Date(extra.recurrenceUntil);
                    const rule = new rrule_1.RRule({
                        freq: rrule_1.RRule.WEEKLY,
                        byweekday: weekdays,
                        dtstart,
                        until,
                    });
                    scheduleData.recurrenceRule = rule.toString();
                }
            }
            const result = await this.DoctorRepository.addSchedule(scheduleData);
            return result;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getSchedule(id) {
        try {
            const result = await this.DoctorRepository.getSchedule(id);
            return result;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getUsers() {
        try {
            const result = await this.DoctorRepository.getUsers();
            return result;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAppointmentUsers(id) {
        try {
            const result = await this.DoctorRepository.getAppointmentUsers(id);
            return result;
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
            throw new Error(`Failed to upload chat image: ${error.message}`);
        }
    }
    //get appointments related to a particular doctor
    async getAppointments(id) {
        try {
            const appointments = await this.DoctorRepository.getAppointments(id);
            return appointments;
        }
        catch (error) {
            throw new Error(`Failed to get appointments: ${error.message}`);
        }
    }
    //doctor accept appointments....
    async acceptAppointment(id) {
        try {
            const accepted = await this.DoctorRepository.acceptAppointment(id);
            return accepted;
        }
        catch (error) {
            throw new Error(`Failed to accept appointment: ${error.message}`);
        }
    }
    async completeAppointment(id) {
        try {
            const completed = await this.DoctorRepository.completeAppointment(id);
            return completed;
        }
        catch (error) {
            throw new Error(`Failed to complete appointment: ${error.message}`);
        }
    }
    async rescheduleAppointment(id, date, time, reason) {
        try {
            const rescheduled = await this.DoctorRepository.rescheduleAppointment(id, date, time, reason);
            await (0, emailConfig_1.default)(rescheduled?.patientId?.email, "Appointment Rescheduled", `Your appointment has been rescheduled to ${date} at ${time}. Reason: ${reason}.`);
            return rescheduled;
        }
        catch (error) {
            throw new Error(`Failed to reschedule appointment: ${error.message}`);
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
            throw new Error(error.message);
        }
    }
    async fetchDashboardStats(doctorId) {
        try {
            return await this.DoctorRepository.getDashboardStats(doctorId);
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async fetchGrowthData(doctorId, timeRange, dateParam) {
        try {
            const growthData = await this.DoctorRepository.getGrowthData(doctorId, timeRange, dateParam);
            return growthData;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDashboardHome(doctorId) {
        try {
            const data = await this.DoctorRepository.getDashboardHome(doctorId);
            return data;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
}
exports.DoctorService = DoctorService;
