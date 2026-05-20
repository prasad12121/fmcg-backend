import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoicePDF = (invoice: any) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();

      const fileName = `invoice_${invoice.invoice_number}.pdf`;
      const filePath = path.join("uploads/invoices", fileName);

      fs.mkdirSync("uploads/invoices", { recursive: true });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // HEADER
      doc.fontSize(16).text("FMCG Invoice", { align: "center" });
      doc.moveDown();

      doc.text(`Invoice No: ${invoice.invoice_number}`);
      doc.text(`Order ID: ${invoice.order_id}`);
      doc.moveDown();

      // PRODUCTS
      invoice.items.forEach((item: any) => {
        doc.text(
          `${item.variant_id} | Qty: ${item.quantity} | ₹${item.price} | Total: ₹${item.total}`
        );
      });

      doc.moveDown();

      // TOTALS
      doc.text(`Subtotal: ₹${invoice.total_amount}`);
      doc.text(`Tax: ₹${invoice.tax}`);
      doc.text(`Grand Total: ₹${invoice.grand_total}`);

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
};