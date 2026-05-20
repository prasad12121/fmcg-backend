import countryRepositoy from "../repositories/country.repositoy";

class CountryService {

  async createCountry(data: any) {
    return await countryRepositoy.create(data);
  }

  async getCountries(filter: Record<string, any> = {}) {
    return await countryRepositoy.find(filter);
  }

  async getCountry(id: string) {
    return await countryRepositoy.findById(id);
  }

  async updateCountry(id: string, data: any) {
    return await countryRepositoy.update(id, data);
  }

  async deleteCountry(id: string) {
    return await countryRepositoy.delete(id);
  }

  async updateCountryStatus(id: string) {
    const country = await countryRepositoy.findById(id);
    if (!country) {
      throw new Error("Country not found");
    }
    country.status = country.status === "active" ? "inactive" : "active";
    return await countryRepositoy.update(id, { status: country.status });
  }

}

export default new CountryService();