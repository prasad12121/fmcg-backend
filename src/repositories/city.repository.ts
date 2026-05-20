import BaseRepository from "./base.repository";
import City from "../models/city.model";

class CityRepository extends BaseRepository<any> {
  constructor() {
    super(City);
  }
}

export default new CityRepository();