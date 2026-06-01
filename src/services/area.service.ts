import areaRepository from "../repositories/area.repository";

class AreaService {

  async createArea(data: any) {
    return await areaRepository.create(data);
  }

  async getAreas(filter: Record<string, any> = {}) {
    return await areaRepository.find(filter, [
      "country_id",
      "state_id",
      "city_id",
    ]);
  }

  async getArea(id: string) {
    return await areaRepository.findById(id);
  }

  async updateArea(id: string, data: any) {
    return await areaRepository.update(id, data);
  }

  async deleteArea(id: string) {
    return await areaRepository.delete(id);
  }

  async updateAreaStatus(id: string) {
    const area = await areaRepository.findById(id);
    if (!area) {
      throw new Error("Area not found");
    }
    area.status = area.status === "active" ? "inactive" : "active";
    return await areaRepository.update(id, { status: area.status });
  }

}

export default new AreaService();