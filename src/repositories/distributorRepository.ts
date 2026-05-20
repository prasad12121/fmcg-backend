import BaseRepository from "./base.repository";
import Distributor from "../models/distributor.model";

class DistributorRepository extends BaseRepository<any> {
  constructor() {
    super(Distributor);
  }
}

export default new DistributorRepository();