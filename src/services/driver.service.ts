//create a service for driver model
import driverRepository from "../repositories/driver.repository";

class DriverService {
    async createDriver(data: any) {
        return await driverRepository.create(data);
    }
    async getDrivers(filter: Record<string, any> = {}) {
        return await driverRepository.find(filter);
    }
    async getDriver(id: string) {
        return await driverRepository.findById(id);
    }
    async updateDriver(id: string, data: any) {
        return await driverRepository.update(id, data);
    }
    async deleteDriver(id: string) {
        return await driverRepository.delete(id);
    }
    async updateDriverStatus(id: string) {
        const driver = await driverRepository.findById(id);
        if (!driver) {
            throw new Error("Driver not found");
        }
        driver.status = driver.status === "active" ? "inactive" : "active";
        return await driverRepository.update(id, { status: driver.status });
    }
}

export default new DriverService();