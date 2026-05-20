import outletRepository from "../repositories/outlet.repository";

class OutletService {

  async createOutlet(data: any) {
    return await outletRepository.create(data);
  }

  async getOutlets(filter: Record<string, any> = {}) {
    return await outletRepository.find(filter,["beat_id"]);
  }

  async getOutlet(id: string) {
    return await outletRepository.findById(id);
  }

  async updateOutlet(id: string, data: any) {
    return await outletRepository.update(id, data);
  }

  async deleteOutlet(id: string) {
    return await outletRepository.delete(id);
  }

  async updateOutletStatus(id: string) {
    const outlet = await outletRepository.findById(id);
    if (!outlet) {
      throw new Error("Outlet not found");
    }
    outlet.status = outlet.status === "active" ? "inactive" : "active";
    return await outletRepository.update(id, { status: outlet.status });
  }

}

export default new OutletService();