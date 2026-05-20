import stateRepositoy from "../repositories/state.repository";

class StateService {

  async createState(data: any) {
    return await stateRepositoy.create(data);
  }

  async getStates(filter: Record<string, any> = {}) {
    return await stateRepositoy.find(filter);
  }
  async getState(id: string, populate: string = "") {
    return await stateRepositoy.findById(id, populate);
  }

  async updateState(id: string, data: any) {
    return await stateRepositoy.update(id, data);
  }

  async deleteState(id: string) {
    return await stateRepositoy.delete(id);
  }


  async updateStateStatus(id: string) {
    const state = await stateRepositoy.findById(id);
    if (!state) {
      throw new Error("State not found");
    }
    state.status = state.status === "active" ? "inactive" : "active";
    return await stateRepositoy.update(id, { status: state.status });
  }

}

export default new StateService();