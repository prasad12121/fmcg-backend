import BaseRepository from "./base.repository";
import SubArea from "../models/subArea.model";

class SubAreaRepository extends BaseRepository<any> {
  constructor() {
    super(SubArea);
  }
}

export default new SubAreaRepository();