import cityRepository from "../repositories/city.repository";

class CityService {

  async createCity(data: any) {
    return await cityRepository.create(data);
  }

  async getCities(filter: Record<string, any> = {}) {
    return await cityRepository.find(filter);
  }

  async getCity(id: string) {
    return await cityRepository.findById(id);
  }

  async updateCity(id: string, data: any) {
    return await cityRepository.update(id, data);
  }

  async deleteCity(id: string) {
    return await cityRepository.delete(id);
  }

  async updateCityStatus(id: string) {
    const city = await cityRepository.findById(id);
    if (!city) {
      throw new Error("City not found");
    }
    city.status = city.status === "active" ? "inactive" : "active";
    return await cityRepository.update(id, { status: city.status });
  }

}

export default new CityService();