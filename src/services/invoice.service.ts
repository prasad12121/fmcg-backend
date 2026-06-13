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

    // ✅ Calculate totals with per-line GST taken from the order item
    // (snapshot of the variant master). Legacy items created before GST was
    // stored have no rate, so they fall back to 18% for backward compatibility.
    let subtotal = 0;
    let tax = 0;

    const invoiceItemsData = items.map(item => {
      const total = item.price * item.quantity;
      const discount = Number(item.discount ?? 0) || 0;
      const rate =
        item.gst_rate === undefined || item.gst_rate === null
          ? 18
          : Number(item.gst_rate) || 0;
      const lineTaxable = Math.max(total - discount, 0);
      const lineTax = Number(((lineTaxable * rate) / 100).toFixed(2));

      subtotal += total;
      tax += lineTax;

      return {
        variant_id: item.variant_id,
        quantity: item.quantity,
        free_quantity: item.free_quantity || 0,
        price: item.price,
        gst_rate: rate,
        tax: lineTax,
        total
      };
    });

    tax = Number(tax.toFixed(2));
    const grand_total = Number((subtotal + tax).toFixed(2));
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