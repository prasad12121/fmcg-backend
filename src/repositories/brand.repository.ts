import BaseRepository from "./base.repository";
import Brand from "../models/brand.model";

class BrandRepository extends BaseRepository<any> {
  constructor() {
    super(Brand);
  }
}

export default new BrandRepository();