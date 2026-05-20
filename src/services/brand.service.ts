import brandRepository from "../repositories/brand.repository";

class BrandService {

  async createBrand(data: any) {
    return await brandRepository.create(data);
  }

  async getBrands(filter: Record<string, any> = {}) {
    return await brandRepository.find(filter);
  }

  async getBrand(id: string) {
    return await brandRepository.findById(id);
  }

  async updateBrand(id: string, data: any) {
    return await brandRepository.update(id, data);
  }

  async deleteBrand(id: string) {
    return await brandRepository.delete(id);
  }

  async updateBrandStatus(id: string) {
    const brand = await brandRepository.findById(id);
    if (!brand) {
      throw new Error("Brand not found");
    }
    brand.status = brand.status === "active" ? "inactive" : "active";
    return await brandRepository.update(id, { status: brand.status });
  }

}

export default new BrandService();