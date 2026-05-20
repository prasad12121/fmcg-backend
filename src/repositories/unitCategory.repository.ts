import BaseRepository from "./base.repository";
import UnitCategoryModel from "../models/unitCategory.model";

class UnitCategoryRepository extends BaseRepository<any> {
  constructor() {
    super(UnitCategoryModel);
  }
}

export default new UnitCategoryRepository();