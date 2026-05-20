import BaseRepository from "./base.repository";
import category from "../models/category.model";

class CategoryRepository extends BaseRepository<any> {
  constructor() {
    super(category);
  }
}

export default new CategoryRepository();