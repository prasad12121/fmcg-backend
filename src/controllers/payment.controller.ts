import { request, response } from "express";
import paymentService from "../services/payment.service";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Payment request failed";

export const createPayment = async (req = request, res = response) => {
  try {
    const payment = await paymentService.createPayment(req.body);
    res.status(201).json(payment);
  } catch (error) {
    const message = getErrorMessage(error);
    const statusCode =
      message.includes("not found") ? 404 :
      message.includes("missing") || message.includes("exceeds") || message.includes("invalid")
        ? 400
        : 500;

    res.status(statusCode).json({ message });
  }
};

export const getPayments = async (req = request, res = response) => {
  try {
    const filter: Record<string, any> = {};

    if (typeof req.query.invoice_id === "string" && req.query.invoice_id.trim()) {
      filter.invoice_id = req.query.invoice_id;
    }

    if (typeof req.query.order_id === "string" && req.query.order_id.trim()) {
      filter.order_id = req.query.order_id;
    }

    const payments = await paymentService.getPayments(filter);
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getPaymentById = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const payment = await paymentService.getPaymentById(id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updatePayment = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const payment = await paymentService.updatePayment(id, req.body);
    res.status(200).json(payment);
  } catch (error) {
    const message = getErrorMessage(error);
    const statusCode =
      message.includes("not found") ? 404 :
      message.includes("missing") ||
      message.includes("exceeds") ||
      message.includes("invalid") ||
      message.includes("greater than 0")
        ? 400
        : 500;

    res.status(statusCode).json({ message });
  }
};

export default createPayment;
