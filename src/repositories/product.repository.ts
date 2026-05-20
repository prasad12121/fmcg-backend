import BaseRepository from "./base.repository";
import Productmodel from "../models/Productmodel";

class ProductRepository extends BaseRepository<any> {
  constructor() {
    super(Productmodel);
  }
}

export default new ProductRepository();