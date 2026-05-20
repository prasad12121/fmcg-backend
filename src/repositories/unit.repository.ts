import BaseRepository from "./base.repository";
import Unit from "../models/unit.model";

class UnitRepository extends BaseRepository<any> {
  constructor() {
    super(Unit);
  }

  async find(filter: Record<string, any> = {}) {
    return await super.find(filter, ["category_id"]);
  }
}

export default new UnitRepository();