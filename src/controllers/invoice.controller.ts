//create invoice
import { request, response } from "express";
import invoiceService from "../services/invoice.service";

export const createInvoice = async (req = request, res = response) => {
    
  try {

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const invoice = await invoiceService.createInvoice(id);
    res.json({
        message: "Invoice generated",
        invoice
      });
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

    const search = req.query.search?.toString() || "";

    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const invoices = await invoiceService.getInvoices(filter);

    res.json(invoices);
  } catch (error) {
    console.log("Error getting invoices", error);
    res.status(500).json({ message: "Error getting invoices" });
  }
};


export default createInvoice;