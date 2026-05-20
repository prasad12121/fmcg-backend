import subAreaRepository from "../repositories/subArea.repository";

class SubAreaService {

  async createSubArea(data: any) {
    return await subAreaRepository.create(data);
  }

  async getSubAreas(filter: Record<string, any> = {}) {
    return await subAreaRepository.find(filter);
  }

  async getSubArea(id: string) {
    return await subAreaRepository.findById(id);
  }

  async updateSubArea(id: string, data: any) {
    return await subAreaRepository.update(id, data);
  }

  async deleteSubArea(id: string) {
    return await subAreaRepository.delete(id);
  }

  async updateSubAreaStatus(id: string) {
    const subArea = await subAreaRepository.findById(id);
    if (!subArea) {
      throw new Error("SubArea not found");
    }
    subArea.status = subArea.status === "active" ? "inactive" : "active";
    return await subAreaRepository.update(id, { status: subArea.status });
  }

}

export default new SubAreaService();