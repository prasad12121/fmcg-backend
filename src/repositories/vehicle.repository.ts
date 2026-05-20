import BaseRepository from "./base.repository";
import VehicleModel from "../models/vehicle.model";

class VehicleRepository extends BaseRepository<any> {
    constructor() {
        super(VehicleModel);
    }

}

export default new VehicleRepository();