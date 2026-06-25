import BaseRepository from "./base.repository";
import paymentModel from "../models/payment.model";

class PaymentRepository extends BaseRepository<any> {
  constructor() {
    super(paymentModel);
  }

  async findByInvoiceId(invoiceId: string) {
    return await this.model.find({ invoice_id: invoiceId }).sort({ createdAt: -1 });
  }

  async findDetailedPayments(filter: Record<string, any> = {}) {
    return await this.model
      .find(filter)
      .populate("invoice_id", "invoice_number grand_total status")
      .populate("order_id", "order_number status")
      .populate("outlet_id", "name")
      .populate("distributor_id", "name")
      .sort({ createdAt: -1 });
  }

  async findDetailedPaymentById(id: string) {
    return await this.model
      .findById(id)
      .populate("invoice_id", "invoice_number grand_total status")
      .populate("order_id", "order_number status")
      .populate("outlet_id", "name")
      .populate("distributor_id", "name");
  }

  async getNextPaymentNumber() {
    const lastPayment = await this.model.findOne().sort({ createdAt: -1, _id: -1 }).lean();

    if (!lastPayment?.payment_number) {
      return "PAY-0001";
    }

    const match = String(lastPayment.payment_number).match(/(\d+)$/);
    const sequence = match ? Number(match[1]) + 1 : 1;

    return `PAY-${String(sequence).padStart(4, "0")}`;
  }
}

export default new PaymentRepository();
