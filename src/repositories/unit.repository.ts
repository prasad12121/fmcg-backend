import BaseRepository from "./base.repository";
import Unit from "../models/unit.model";

class UnitRepository extends BaseRepository<any> {
  constructor() {
    super(Unit);
  }
}

export default new UnitRepository();