import BaseRepository from "./base.repository";
import CountriesModel from "../models/countries.model";

class CountryRepository extends BaseRepository<any> {
  constructor() {
    super(CountriesModel);
  }
}

export default new CountryRepository();