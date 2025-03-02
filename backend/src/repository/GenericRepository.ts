import { Model, Document, FilterQuery } from "mongoose";

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

  //for appointment purpose only
  async findOne(id: string): Promise<T | null> {
    return this.model.findOne({appointmentId: id}).exec();
  }
  //

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  //for appointment purpose only
  async updateOne(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findOneAndUpdate({ appointmentId: id }, data, { new: true }).exec();
  }
  //

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}


//TODO: I have to implement this reusable setup for all specific repositories and models