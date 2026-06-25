import bcrypt from "bcryptjs";

import User from "../models/user.model";
import Outlet from "../models/outlet.omodel";
import outletRepository from "../repositories/outlet.repository";

class OutletService {

  constructor() {
    // One-time migration: create User records for existing outlets that don't have one.
    // Runs silently at startup — safe to repeat (skips outlets whose email already has a User).
    this.migrateOutletUsers().catch((err) =>
      console.error("[OutletService] User migration failed:", err)
    );
  }

  private async migrateOutletUsers() {
    const outlets = await Outlet.find({}).select("email name owner_name password _id").lean();
    let created = 0;

    for (const outlet of outlets) {
      const email = String((outlet as any).email || "").toLowerCase().trim();
      if (!email) continue;

      const existing = await User.findOne({ email });
      if (existing) {
        // Ensure the outlet_id link is set even if the User was created another way
        if (!(existing as any).outlet_id) {
          await User.findByIdAndUpdate(existing._id, {
            outlet_id: (outlet as any)._id,
            role: "outlet",
            isVerified: true,
          });
        }
        continue;
      }

      const plainPassword = String((outlet as any).password || "");
      if (!plainPassword) continue;

      const passwordHash = await bcrypt.hash(plainPassword, 12);
      await User.create({
        name: String((outlet as any).owner_name || (outlet as any).name || email),
        email,
        passwordHash,
        role: "outlet",
        outlet_id: (outlet as any)._id,
        isVerified: true,
      }).catch((err: any) => {
        // Skip if email uniqueness constraint fires (race condition)
        if (err.code !== 11000) throw err;
      });
      created++;
    }

    if (created > 0) {
      console.log(`[OutletService] Migration complete — created ${created} User account(s) for existing outlets.`);
    }
  }

  async createOutlet(data: any) {
    return await outletRepository.create(data);
  }

  async getOutlets(filter: Record<string, any> = {}) {
    return await outletRepository.find(filter, ["beat_id", "distributor_id"]);
  }

  async getOutlet(id: string) {
    return await outletRepository.findById(id, "beat_id");
  }

  async updateOutlet(id: string, data: any) {
    return await outletRepository.update(id, data);
  }

  async deleteOutlet(id: string) {
    return await outletRepository.delete(id);
  }

  async updateOutletStatus(id: string) {
    const outlet = await outletRepository.findById(id);
    if (!outlet) {
      throw new Error("Outlet not found");
    }
    outlet.status = outlet.status === "active" ? "inactive" : "active";
    return await outletRepository.update(id, { status: outlet.status });
  }

}

export default new OutletService();
