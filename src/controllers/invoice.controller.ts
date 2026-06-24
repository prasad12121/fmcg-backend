// Invoice controller
import { request, response } from "express";
import mongoose from "mongoose";
import Order from "../models/order.model";
import invoiceService from "../services/invoice.service";

export const createInvoice = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const invoice = await invoiceService.createInvoice(id);
    res.json({ message: "Invoice generated", invoice });
  } catch (error) {
    console.log("Error creating invoice", error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Error creating invoice" });
    }
  }
};


export const getInvoices = async (req = request, res = response) => {
  try {
    const filter: Record<string, any> = {};

    // Distributor: scope invoices to orders belonging to their distributor_id
    if (req.user?.role === "Distributor" && req.user.distributor_id) {
      const orders = await Order.find(
        { distributor_id: new mongoose.Types.ObjectId(req.user.distributor_id) },
        { _id: 1 }
      ).lean();
      const orderIds = orders.map((o: any) => o._id);
      filter.order_id = { $in: orderIds };
    }

    const invoices = await invoiceService.getInvoices(filter);
    res.json(invoices);
  } catch (error) {
    console.log("Error getting invoices", error);
    res.status(500).json({ message: "Error getting invoices" });
  }
};


export default createInvoice;
