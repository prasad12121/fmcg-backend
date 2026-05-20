import unitCategoryRepository from "../repositories/unitCategory.repository";

class UnitCategoryService {

  async createUnitCategory(data: any) {
    return await unitCategoryRepository.create(data);
  }

  async getUnitCategories(filter: Record<string, any> = {}) {
    return await unitCategoryRepository.find(filter);
  }

  async getUnitCategory(id: string) {
    return await unitCategoryRepository.findById(id);
  }

  async updateUnitCategory(id: string, data: any) {
    return await unitCategoryRepository.update(id, data);
  }

  async deleteUnitCategory(id: string) {
    return await unitCategoryRepository.delete(id);
  }

  async updateUnitCategoryStatus(id: string) {
    const unitCategory = await unitCategoryRepository.findById(id);
    if (!unitCategory) {
      throw new Error("Unit category not found");
    }
    unitCategory.status = unitCategory.status === "active" ? "inactive" : "active";
    return await unitCategoryRepository.update(id, { status: unitCategory.status });
  }

}

export default new UnitCategoryService();