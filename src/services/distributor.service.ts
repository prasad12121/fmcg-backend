import distributorRepository from "../repositories/distributorRepository";

class DistributorService {

  async createDistributor(data: any) {
    return await distributorRepository.create(data);
  }

  async getDistributors(filter: Record<string, any> = {}) {
    return await distributorRepository.find(filter);
  }

  async getDistributor(id: string) {
    return await distributorRepository.findById(id);
  }

  async updateDistributor(id: string, data: any) {
    return await distributorRepository.update(id, data);
  }

  async deleteDistributor(id: string) {
    return await distributorRepository.delete(id);
  }

  async updateDistributorStatus(id: string) {
    const distributor = await distributorRepository.findById(id);
    if (!distributor) {
      throw new Error("Distributor not found");
    }
    distributor.status = distributor.status === "active" ? "inactive" : "active";
    return await distributorRepository.update(id, { status: distributor.status });
  }

}

export default new DistributorService();