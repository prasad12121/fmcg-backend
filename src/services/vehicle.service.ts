import vehicleRepository from "../repositories/vehicle.repository";

class VehicleService {

    async createVehicle(data: any) {
        return await vehicleRepository.create(data);
    }

    async getVehicles(filter: Record<string, any> = {}) {
        return await vehicleRepository.find(filter, ["distributor_id"]);
    }

    async getVehicle(id: string) {
        return await vehicleRepository.findById(id, "driver_id, status");
    }

    async updateVehicle(id: string, data: any) {
        return await vehicleRepository.findByIdAndUpdate(id, data);
    }

    async deleteVehicle(id: string) {

        return await vehicleRepository.delete(id);
    }

    async updateVehicleStatus(id: string) {
        const vehicle = await vehicleRepository.findById(id);
        if (!vehicle) {
            throw new Error("Vehicle not found");
        }
        vehicle.status = vehicle.status === "available" ? "busy" : "available";
        return await vehicleRepository.update(id, { status: vehicle.status });
    }
}

export default new VehicleService();