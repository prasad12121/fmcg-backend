import bcrypt from "bcryptjs";
import { request, response } from "express";

import User from "../models/user.model";
import distributorService from "../services/distributor.service";


export const createDistributor = async (req = request, res = response) => {
  try {
    const { password, email, name, ...rest } = req.body;

    // 1. Create the Distributor business record
    const distributor = await distributorService.createDistributor({ ...rest, email, name, password });

    // 2. Create a linked User account so the distributor can log in
    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (!existingUser) {
      const passwordHash = await bcrypt.hash(String(password), 12);
      await User.create({
        name: String(name),
        email: normalizedEmail,
        passwordHash,
        role: "Distributor",
        distributor_id: (distributor as any)._id,
        isVerified: true,
      });
    } else {
      // Link existing user to this distributor
      await User.findByIdAndUpdate(existingUser._id, {
        role: "Distributor",
        distributor_id: (distributor as any)._id,
        isVerified: true,
      });
    }

    res.status(201).json(distributor);
  } catch (error) {
    res.status(500).json({ message: "Error creating distributor", error });
  }
};


export const getDistributors = async (req = request, res = response) => {
  try {

    const search = req.query.search?.toString() || "";

    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const distributors = await distributorService.getDistributors(filter);
    res.status(200).json(distributors);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching distributors" });
  }
};

//Get a single distributor by ID
export const getDistributor = async (req = request, res = response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const distributor = await distributorService.getDistributor(id);
    if (!distributor) {
      return res.status(404).json({ message: "Distributor not found" });
    }
    res.status(200).json(distributor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching distributor", error });
  }
};

//Update a distributor by ID
export const updateDistributor = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { password, ...rest } = req.body;

    // If admin supplied a new password, hash it and sync the linked User account
    if (password && String(password).trim()) {
      const passwordHash = await bcrypt.hash(String(password).trim(), 12);

      // Update the Distributor record's plain-text password field (legacy design)
      rest.password = String(password).trim();

      // Sync the linked User's hashed password so login still works
      await User.findOneAndUpdate(
        { distributor_id: id },
        { passwordHash },
        { returnDocument: "before" }
      );
    }

    const distributor = await distributorService.updateDistributor(id, rest);
    if (!distributor) {
      return res.status(404).json({ message: "Distributor not found" });
    }
    res.status(200).json(distributor);
  } catch (error) {
    res.status(500).json({ message: "Error updating distributor", error });
  }
};

//Delete a distributor by ID
export const deleteDistributor = async (req = request, res = response) => {
  try {

     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const distributor = await distributorService.deleteDistributor(id);
    if (!distributor) {
      return res.status(404).json({ message: "Distributor not found" });
    }

    res.status(200).json({ message: "Distributor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting distributor", error });
  }
};

//change distributor status
export const updateDistributorStatus = async (req = request, res = response) => {
  try {


     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const distributor = await distributorService.updateDistributorStatus(id);

    res.status(200).json({
      message: `Distributor status updated to ${distributor.status}`,
      data: distributor
    });

  } catch (error: any) {

    if (error.message === "Distributor not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error updating distributor status",
      error: error.message
    });
  }
};
