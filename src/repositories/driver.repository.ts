//create a repository for driver model
import BaseRepository from "./base.repository";
import DriverModel from "../models/driver.model";

class DriverRepository extends BaseRepository<any> {
    constructor() {
        super(DriverModel);
    }
}

export default new DriverRepository();