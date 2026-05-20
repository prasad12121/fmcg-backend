import BaseRepository from "./base.repository";
import returnModel from "../models/return.model";

class ReturnsRepository extends BaseRepository<any> {
  constructor() {
    super(returnModel);
  }
}

export default new ReturnsRepository();
