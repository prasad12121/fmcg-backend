import unitRepository from "../repositories/unit.repository";

class UnitService {

  async createUnit(data: any) {
    return await unitRepository.create(data);
  }

  async getUnits(filter: Record<string, any> = {}) {
    return await unitRepository.find(filter);
  }

  async getUnit(id: string) {
    return await unitRepository.findById(id);
  }

  async updateUnit(id: string, data: any) {
    return await unitRepository.update(id, data);
  }

  async deleteUnit(id: string) {
    return await unitRepository.delete(id);
  }

  async updateUnitStatus(id: string) {
    const unit = await unitRepository.findById(id);
    if (!unit) {
      throw new Error("Unit not found");
    }
    unit.status = unit.status === "active" ? "inactive" : "active";
    return await unitRepository.update(id, { status: unit.status });
  }

}

export default new UnitService();