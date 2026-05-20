import BaseRepository from "./base.repository";
import Area from "../models/area.model";

class AreaRepository extends BaseRepository<any> {
  constructor() {
    super(Area);
  }
}

export default new AreaRepository();