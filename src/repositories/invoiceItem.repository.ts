

import BaseRepository from "./base.repository";
import invoiceItemsModel from "../models/invoiceItems.model";

class InvoiceItemRepository extends BaseRepository<any> {
  constructor() {
    super(invoiceItemsModel);
  }
}

export default new InvoiceItemRepository();