import categoryRepository from "../repositories/category.repository";

class CategoryService {

  async createCategory(data: any) {
    return await categoryRepository.create(data);
  }

  async getCategories(filter: Record<string, any> = {}) {
    return await categoryRepository.find(filter);
  }

  async getCategory(id: string) {
    return await categoryRepository.findById(id);
  }

  async updateCategory(id: string, data: any) {
    return await categoryRepository.update(id, data);
  }

  async deleteCategory(id: string) {
    return await categoryRepository.delete(id);
  }

  async updateCategoryStatus(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    category.status = category.status === "active" ? "inactive" : "active";
    return await categoryRepository.update(id, { status: category.status });
  }

}

export default new CategoryService();