"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericRepository = void 0;
class GenericRepository {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return this.model.create(data);
    }
    async findById(id) {
        return this.model.findById(id).exec();
    }
    // for appointment purpose only
    async findOne(id) {
        return this.model.findOne({ appointmentId: id }).exec();
    }
    async findAll(filter = {}) {
        return this.model.find(filter).exec();
    }
    findAllQuery(filter = {}) {
        return this.model.find(filter);
    }
    async update(id, data) {
        return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    }
    // for appointment purpose only
    // async updateOne(id: string, data: Partial<T>): Promise<T | null> {
    //   return this.model.findOneAndUpdate({ appointmentId: id }, data, { new: true }).exec();
    // }
    async updateOne(id, data) {
        if ("doctorId" in data &&
            typeof data.doctorId === "object" &&
            data.doctorId?._id) {
            data.doctorId = data.doctorId._id;
        }
        if ("patientId" in data &&
            typeof data.patientId === "object" &&
            data.patientId?._id) {
            data.patientId = data.patientId._id;
        }
        return this.model
            .findOneAndUpdate({ appointmentId: id }, data, { new: true })
            .populate("patientId", "name email")
            .populate("doctorId", "name email")
            .exec();
    }
    async delete(id) {
        const result = await this.model.findByIdAndDelete(id).exec();
        return !!result;
    }
    // New method that supports update operators (like $push)
    async updateWithOperators(id, data) {
        return this.model.findOneAndUpdate({ _id: id }, data, { new: true }).exec();
    }
    async countDocuments(filter = {}) {
        return this.model.countDocuments(filter).exec();
    }
    async findOneWithPopulate(filter, populateFields) {
        let query = this.model.findOne(filter);
        populateFields.forEach((field) => {
            query = query.populate(field);
        });
        return query.exec();
    }
    async updateOneWithPopulate(filter, data, populateFields) {
        let query = this.model.findOneAndUpdate(filter, data, { new: true });
        populateFields.forEach((field) => {
            query = query.populate(field);
        });
        return query.exec();
    }
}
exports.GenericRepository = GenericRepository;
//TODO: I have to implement this reusable setup for all specific repositories and models
