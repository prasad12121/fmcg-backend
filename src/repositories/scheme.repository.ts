import BaseRepository from "./base.repository";
import schemeModel from "../models/scheme.model";

class SchemeRepository extends BaseRepository<any> {
  constructor() {
    super(schemeModel);
  }

    async findByVariant(variantId: string) {
    return await this.model.findOne({ variant_id: variantId });
    
    
    }
}

export default new SchemeRepository();