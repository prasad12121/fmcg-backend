import BaseRepository from "./base.repository";
import Outlet from "../models/outlet.omodel";

class OutletRepository extends BaseRepository<any> {
  constructor() {
    super(Outlet);
  }
}

export default new OutletRepository();