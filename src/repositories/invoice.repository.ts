import BaseRepository from "./base.repository";
import invoiceModel from "../models/invoice.model";

class InvoiceRepository extends BaseRepository<any> {
  constructor() {
    super(invoiceModel);
  }

  async findByOrderId(orderId: string) {
    return await this.model.findOne({ order_id: orderId });
  }
}

export default new InvoiceRepository();
