import BaseRepository from "./base.repository";
import schemeModel from "../models/scheme.model";

class SchemeRepository extends BaseRepository<any> {
  constructor() {
    super(schemeModel);
  }
}

export default new SchemeRepository();
