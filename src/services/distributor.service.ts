import bcrypt from "bcryptjs";

import Distributor from "../models/distributor.model";
import User from "../models/user.model";
import distributorRepository from "../repositories/distributorRepository";

class DistributorService {

  constructor() {
    // One-time migration: create User records for existing distributors that don't have one.
    // Safe to repeat — skips distributors whose email already has a User.
    this.migrateDistributorUsers().catch((err) =>
      console.error("[DistributorService] User migration failed:", err)
    );
  }

  private async migrateDistributorUsers() {
    const distributors = await Distributor.find({})
      .select("email name owner_name password _id")
      .lean();
    let created = 0;

    for (const dist of distributors) {
      const email = String((dist as any).email || "").toLowerCase().trim();
      if (!email) continue;

      const existing = await User.findOne({ email });
      if (existing) {
        // Ensure the distributor_id link and role are set
        if (
          !(existing as any).distributor_id ||
          String((existing as any).distributor_id) !== String((dist as any)._id)
        ) {
          await User.findByIdAndUpdate(existing._id, {
            role: "Distributor",
            distributor_id: (dist as any)._id,
            isVerified: true,
          });
        }
        continue;
      }

      const plainPassword = String((dist as any).password || "");
      if (!plainPassword) continue;

      const passwordHash = await bcrypt.hash(plainPassword, 12);
      await User.create({
        name: String((dist as any).owner_name || (dist as any).name || email),
        email,
        passwordHash,
        role: "Distributor",
        distributor_id: (dist as any)._id,
        isVerified: true,
      }).catch((err: any) => {
        if (err.code !== 11000) throw err;
      });
      created++;
    }

    if (created > 0) {
      console.log(
        `[DistributorService] Migration complete — created ${created} User account(s) for existing distributors.`
      );
    }
  }

  async createDistributor(data: any) {
    return await distributorRepository.create(data);
  }

  async getDistributors(filter: Record<string, any> = {}) {
    return await distributorRepository.find(filter, ["area_id", "city_id"]);
  }

  async getDistributor(id: string) {
    return await distributorRepository.findById(id);
  }

  async updateDistributor(id: string, data: any) {
    return await distributorRepository.update(id, data);
  }

  async deleteDistributor(id: string) {
    return await distributorRepository.delete(id);
  }

  async updateDistributorStatus(id: string) {
    const distributor = await distributorRepository.findById(id);
    if (!distributor) {
      throw new Error("Distributor not found");
    }
    distributor.status = distributor.status === "active" ? "inactive" : "active";
    return await distributorRepository.update(id, { status: distributor.status });
  }

}

export default new DistributorService();
