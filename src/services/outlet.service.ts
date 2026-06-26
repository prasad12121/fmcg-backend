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

  /**
   * Returns a bcrypt hash for the given password string.
   * If the value is already a bcrypt hash (starts with $2a$ or $2b$), it is
   * returned as-is to prevent double-hashing, which would make login impossible.
   */
  private async hashPassword(plainOrHash: string): Promise<string> {
    if (/^\$2[ab]\$\d+\$/.test(plainOrHash)) {
      // Already hashed — do not hash again
      return plainOrHash;
    }
    return bcrypt.hash(plainOrHash, 12);
  }

  private async migrateOutletUsers() {
    const outlets = await Outlet.find({}).select("email name owner_name password _id").lean();
    let created = 0;
    let linked  = 0;

    for (const outlet of outlets) {
      const email = String((outlet as any).email || "").toLowerCase().trim();
      if (!email) continue;

      const existing = await User.findOne({ email }).select("+passwordHash");
      if (existing) {
        // Ensure the outlet_id link is set even if the User was created another way
        if (!(existing as any).outlet_id) {
          const plainOrHash = String((outlet as any).password || "");
          const update: Record<string, any> = {
            outlet_id: (outlet as any)._id,
            role: "outlet",
            isVerified: true,
          };
          // Sync password if the User's hash is missing or was set from a different source
          if (plainOrHash) {
            update.passwordHash = await this.hashPassword(plainOrHash);
          }
          await User.findByIdAndUpdate(existing._id, update);
          linked++;
        }
        continue;
      }

      const plainOrHash = String((outlet as any).password || "");
      if (!plainOrHash) {
        console.warn(`[OutletService] Outlet ${(outlet as any)._id} (${email}) has no password — skipping User creation.`);
        continue;
      }

      const passwordHash = await this.hashPassword(plainOrHash);
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

    if (created > 0 || linked > 0) {
      console.log(`[OutletService] Migration complete — created ${created} User(s), linked ${linked} existing User(s) for outlets.`);
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
