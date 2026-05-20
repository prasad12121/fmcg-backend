import BaseRepository from "./base.repository";
import StateModel from "../models/state.model";

class StateRepository extends BaseRepository<any> {
  constructor() {
    super(StateModel);
  }
}

export default new StateRepository();