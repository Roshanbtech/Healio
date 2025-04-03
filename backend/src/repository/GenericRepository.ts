import { Model, Document, FilterQuery, Query, UpdateQuery } from "mongoose";

export class GenericRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  // for appointment purpose only
  async findOne(id: string): Promise<T | null> {
    return this.model.findOne({ appointmentId: id }).exec();
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  findAllQuery(filter: FilterQuery<T> = {}): Query<T[], T> {
    return this.model.find(filter);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  // for appointment purpose only
  // async updateOne(id: string, data: Partial<T>): Promise<T | null> {
  //   return this.model.findOneAndUpdate({ appointmentId: id }, data, { new: true }).exec();
  // }

  async updateOne(id: string, data: Partial<T>): Promise<T | null> {
    if ('doctorId' in data && typeof (data as any).doctorId === 'object' && (data as any).doctorId?._id) {
      (data as any).doctorId = (data as any).doctorId._id;
    }
    if ('patientId' in data && typeof (data as any).patientId === 'object' && (data as any).patientId?._id) {
      (data as any).patientId = (data as any).patientId._id;
    }
    
    return this.model
      .findOneAndUpdate({ appointmentId: id }, data, { new: true })
      .populate("patientId", "name email")
      .populate("doctorId", "name email")
      .exec();
  }
  

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  // New method that supports update operators (like $push)
  async updateWithOperators(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate({ _id: id }, data, { new: true }).exec();
  }

  async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async findOneWithPopulate(filter: FilterQuery<T>, populateFields: string[]): Promise<T | null> {
    let query = this.model.findOne(filter);
    populateFields.forEach(field => {
      query = query.populate(field);
    });
    return query.exec();
  }
  
  async updateOneWithPopulate(filter: FilterQuery<T>, data: Partial<T>, populateFields: string[]): Promise<T | null> {
    let query = this.model.findOneAndUpdate(filter, data, { new: true });
    populateFields.forEach(field => {
      query = query.populate(field);
    });
    return query.exec();
  }
  
}



//TODO: I have to implement this reusable setup for all specific repositories and models