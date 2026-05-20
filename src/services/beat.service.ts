import beatRepository from "../repositories/beat.repository";

class BeatService {

  async createBeat(data: any) {
    return await beatRepository.create(data);
  }

  async getBeats(filter: Record<string, any> = {}) {
    return await beatRepository.find(filter);
  }

  async getBeat(id: string) {
    return await beatRepository.findById(id);
  }

  async updateBeat(id: string, data: any) {
    return await beatRepository.update(id, data);
  }

  async deleteBeat(id: string) {
    return await beatRepository.delete(id);
  }

  async updateBeatStatus(id: string) {
    const beat = await beatRepository.findById(id);
    if (!beat) {
      throw new Error("Beat not found");
    }
    beat.status = beat.status === "active" ? "inactive" : "active";
    return await beatRepository.update(id, { status: beat.status });
  }

}

export default new BeatService();