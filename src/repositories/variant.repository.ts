import BaseRepository from "./base.repository";
import VariantModel from "../models/variant.model";

class VariantRepository extends BaseRepository<any> {
  constructor() {
    super(VariantModel);
  }
}

export default new VariantRepository();