import invoiceRepository from "../repositories/invoice.repository";
import orderRepository from "../repositories/order.repository";
import outletRepository from "../repositories/outlet.repository";
import paymentRepository from "../repositories/payment.repository";

class PaymentService {
  private roundCurrency(value: number) {
    return Number(Number(value || 0).toFixed(2));
  }

  private calculatePaymentStatus(totalPaid: number, invoiceTotal: number) {
    const roundedTotalPaid = this.roundCurrency(totalPaid);
    const roundedInvoiceTotal = this.roundCurrency(invoiceTotal);

    if (roundedTotalPaid <= 0) return "unpaid";
    if (roundedTotalPaid < roundedInvoiceTotal) return "partial";
    if (roundedTotalPaid === roundedInvoiceTotal) return "paid";
    return "overdue";
  }

  private isValidPaymentStatus(status: string) {
    return ["unpaid", "partial", "paid", "overdue"].includes(status);
  }

  private mapPaymentResponse(payment: any) {
    return {
      _id: payment._id,
      payment_number: payment.payment_number,
      invoice_id: payment.invoice_id?._id || payment.invoice_id,
      invoice_number: payment.invoice_id?.invoice_number || "",
      order_id: payment.order_id?._id || payment.order_id,
      order_number: payment.order_id?.order_number || "",
      outlet_id: payment.outlet_id?._id || payment.outlet_id,
      outlet_name: payment.outlet_id?.name || "",
      distributor_id: payment.distributor_id?._id || payment.distributor_id,
      distributor_name: payment.distributor_id?.name || "",
      payment_date: payment.payment_date,
      payment_mode: payment.payment_mode,
      amount_paid: payment.amount_paid,
      reference_number: payment.reference_number,
      remarks: payment.remarks,
      status: payment.status,
      invoice_total: payment.invoice_total,
      total_paid: payment.total_paid,
      due_amount: payment.due_amount,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  async createPayment(data: any) {
    const {
      invoice_id,
      order_id,
      outlet_id,
      payment_date,
      payment_mode,
      amount_paid,
      reference_number = "",
      remarks = "",
    } = data;

    if (!invoice_id || !order_id || !outlet_id || !payment_date || !payment_mode || amount_paid === undefined) {
      throw new Error("Required fields are missing");
    }

    const amount = this.roundCurrency(Number(amount_paid));
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Amount paid must be greater than 0");
    }

    const invoice = await invoiceRepository.findById(invoice_id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const order = await orderRepository.findById(order_id);
    if (!order) {
      throw new Error("Order not found");
    }

    const outlet = await outletRepository.findById(outlet_id);
    if (!outlet) {
      throw new Error("Outlet not found");
    }

    if (String(invoice.order_id) !== String(order._id)) {
      throw new Error("Invoice does not belong to the provided order");
    }

    if (String(invoice.outlet_id) !== String(outlet._id) || String(order.outlet_id) !== String(outlet._id)) {
      throw new Error("Invoice, order, and outlet association is invalid");
    }

    const previousPayments = await paymentRepository.findByInvoiceId(invoice_id);
    const previousTotalPaid = this.roundCurrency(previousPayments.reduce(
      (sum, item) => sum + Number(item.amount_paid || 0),
      0,
    ));

    const invoiceTotal = this.roundCurrency(Number(invoice.grand_total || 0));
    const remainingDueBeforePayment = this.roundCurrency(
      Math.max(invoiceTotal - previousTotalPaid, 0)
    );

    if (amount - remainingDueBeforePayment > 0.009) {
      throw new Error("Amount paid exceeds due amount");
    }

    const nextTotalPaid = this.roundCurrency(
      Math.min(previousTotalPaid + amount, invoiceTotal)
    );
    const dueAmount = this.roundCurrency(Math.max(invoiceTotal - nextTotalPaid, 0));

    const status = this.calculatePaymentStatus(nextTotalPaid, invoiceTotal);

    const payment = await paymentRepository.create({
      payment_number: await paymentRepository.getNextPaymentNumber(),
      invoice_id,
      order_id,
      outlet_id,
      payment_date,
      payment_mode,
      amount_paid: amount,
      reference_number,
      remarks,
      invoice_total: invoiceTotal,
      total_paid: nextTotalPaid,
      due_amount: dueAmount,
      status,
    });

    await invoiceRepository.update(invoice_id, {
      status: status === "paid" ? "paid" : "generated",
    });

    const detailedPayment = await paymentRepository.findDetailedPaymentById(String(payment._id));
    return this.mapPaymentResponse(detailedPayment || payment);
  }

  async updatePayment(id: string, data: any) {
    const existingPayment = await paymentRepository.findById(id);
    if (!existingPayment) {
      throw new Error("Payment not found");
    }

    const {
      payment_date,
      payment_mode,
      amount_paid,
      reference_number = "",
      remarks = "",
      status,
    } = data;

    if (!payment_date || !payment_mode || amount_paid === undefined) {
      throw new Error("Required fields are missing");
    }

    const amount = this.roundCurrency(Number(amount_paid));
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Amount paid must be greater than 0");
    }

    if (
      typeof status === "string" &&
      status.trim() &&
      !this.isValidPaymentStatus(status)
    ) {
      throw new Error("Invalid payment status");
    }

    const invoice = await invoiceRepository.findById(String(existingPayment.invoice_id));
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const order = await orderRepository.findById(String(existingPayment.order_id));
    if (!order) {
      throw new Error("Order not found");
    }

    const outlet = await outletRepository.findById(String(existingPayment.outlet_id));
    if (!outlet) {
      throw new Error("Outlet not found");
    }

    if (String(invoice.order_id) !== String(order._id)) {
      throw new Error("Invoice does not belong to the provided order");
    }

    if (String(invoice.outlet_id) !== String(outlet._id) || String(order.outlet_id) !== String(outlet._id)) {
      throw new Error("Invoice, order, and outlet association is invalid");
    }

    const previousPayments = await paymentRepository.findByInvoiceId(String(existingPayment.invoice_id));
    const otherPaymentsTotal = this.roundCurrency(previousPayments
      .filter((item) => String(item._id) !== String(existingPayment._id))
      .reduce((sum, item) => sum + Number(item.amount_paid || 0), 0));

    const invoiceTotal = this.roundCurrency(Number(invoice.grand_total || 0));
    const remainingDueBeforePayment = this.roundCurrency(
      Math.max(invoiceTotal - otherPaymentsTotal, 0)
    );

    if (amount - remainingDueBeforePayment > 0.009) {
      throw new Error("Amount paid exceeds due amount");
    }

    const nextTotalPaid = this.roundCurrency(
      Math.min(otherPaymentsTotal + amount, invoiceTotal)
    );
    const dueAmount = this.roundCurrency(Math.max(invoiceTotal - nextTotalPaid, 0));

    const computedStatus = this.calculatePaymentStatus(nextTotalPaid, invoiceTotal);
    const nextStatus =
      typeof status === "string" && status.trim() ? status.trim() : computedStatus;

    const updatedPayment = await paymentRepository.update(id, {
      payment_date,
      payment_mode,
      amount_paid: amount,
      reference_number,
      remarks,
      invoice_total: invoiceTotal,
      total_paid: nextTotalPaid,
      due_amount: dueAmount,
      status: nextStatus,
    });

    await invoiceRepository.update(String(existingPayment.invoice_id), {
      status: nextTotalPaid >= invoiceTotal ? "paid" : "generated",
    });

    const detailedPayment = await paymentRepository.findDetailedPaymentById(id);
    return this.mapPaymentResponse(detailedPayment || updatedPayment);
  }

  async getPayments(filter: Record<string, any> = {}) {
    const payments = await paymentRepository.findDetailedPayments(filter);
    return payments.map((payment) => this.mapPaymentResponse(payment));
  }

  async getPaymentById(id: string) {
    const payment = await paymentRepository.findDetailedPaymentById(id);
    if (!payment) {
      return null;
    }

    return this.mapPaymentResponse(payment);
  }
}

export default new PaymentService();
