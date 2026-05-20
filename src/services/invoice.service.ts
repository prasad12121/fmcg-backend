import orderRepository from "../repositories/order.repository";
import orderItemRepository from "../repositories/orderItem.repository";
import invoiceRepository from "../repositories/invoice.repository";
import invoiceItemRepository from "../repositories/invoiceItem.repository";
import { generateInvoicePDF } from "../utils/generateInvoicePDF";


class InvoiceService {

  async createInvoice(orderId: string) {

    const existingInvoice = await invoiceRepository.find({ order_id: orderId });
    if (existingInvoice.length > 0) throw new Error("Invoice already exists");

    const order = await orderRepository.findById(orderId);

    if (!order) throw new Error("Order not found");

    const items = await orderItemRepository.find({ order_id: orderId });

    if (!items.length) throw new Error("No order items found");

    // ✅ Calculate totals
    let subtotal = 0;

    const invoiceItemsData = items.map(item => {
      const total = item.price * item.quantity;
      subtotal += total;

      return {
        variant_id: item.variant_id,
        quantity: item.quantity,
        free_quantity: item.free_quantity || 0,
        price: item.price,
        total
      };
    });

    const tax = subtotal * 0.18; // GST 18%
    const grand_total = subtotal + tax;
    const randomNumber = Math.floor(100000 + Math.random() * 900000);

    // ✅ Create invoice
    const invoice = await invoiceRepository.create({
      invoice_number: `INV-${randomNumber}`, // 🔥 auto generate
      order_id: orderId,
      outlet_id: order.outlet_id,
      total_amount: subtotal,
      tax,
      grand_total,
      status: "generated"
    });
  
    // ✅ Create invoice items
    for (const item of invoiceItemsData) {
      await invoiceItemRepository.create({
        invoice_id: invoice._id,
        ...item
      });
    }

    // ✅ Update order
    await orderRepository.update(orderId, {
      status: "invoiced"
    });

    const pdfPath = await generateInvoicePDF({
      ...invoice.toObject(),
      items: invoiceItemsData
    });

    invoice.pdf_path = pdfPath;
    await invoiceRepository.update(invoice._id, { pdf_path: pdfPath });
    return invoice;
  }

  async getInvoices(filter: Record<string, any> = {}) {
    return await invoiceRepository.find(filter);
  }
}

export default new InvoiceService();