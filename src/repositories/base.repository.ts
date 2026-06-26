import { Model, Document, PipelineStage } from "mongoose";

export default class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async findAll(filter: any = {}, p0: string[]): Promise<T[]> {
    return await this.model.find(filter).sort({ createdAt: -1 });
  }

  async findById(id: string, populate: string = ""): Promise<T | null> {

    if (populate) {
      return await this.model.findById(id).populate(populate);
    }
    return await this.model.findById(id);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { returnDocument: "after" });
  }

  async findByIdAndUpdate(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { returnDocument: "after" });
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async delete(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async find(
    filter: Record<string, any> = {},
    populateFields: string[] = []
  ): Promise<T[]> {
    let query = this.model.find(filter);

    // Apply populate dynamically
    populateFields.forEach((field) => {
      query = query.populate(field, "name");
    });

    return await query.sort({ createdAt: -1 });
  }

  aggregate<T = unknown>(pipeline: PipelineStage[]) {
    return this.model.aggregate<T>(pipeline).exec();
  }



}