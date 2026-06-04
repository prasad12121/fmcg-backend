//create a service for dispatch model

import dispatchItemRepository from "../repositories/dispatchItem.repository";
import dispatchRepository from "../repositories/dispatch.repository";
import driverRepository from "../repositories/driver.repository";
import invoiceRepository from "../repositories/invoice.repository";
import orderItemRepository from "../repositories/orderItem.repository";
import orderRepository from "../repositories/order.repository";
import stockLedgerService from "./stockLedger.service";
import stockRepository from "../repositories/stock.repository";
import vehicleRepository from "../repositories/vehicle.repository";

export class DispatchService {
    private async applyDeliveryStockDelta(params: {
        distributor_id: string;
        variant_id: string;
        dispatch_id: string;
        delta: number;
    }) {
        const { distributor_id, variant_id, dispatch_id, delta } = params;

        if (!delta) {
            return;
        }

        const stock = await stockRepository.findByDistributorVariant(
            distributor_id,
            variant_id,
        );

        if (delta > 0) {
            if (!stock || stock.quantity < delta) {
                throw new Error(`Insufficient stock for variant ${variant_id}`);
            }

            await stockLedgerService.createStockEntry({
                distributor_id,
                variant_id,
                type: "delivery_confirmed",
                quantity: delta,
                reference_id: dispatch_id,
                note: `Delivery confirmed for dispatch ${dispatch_id}`,
            });

            await stockRepository.update(String(stock._id), {
                quantity: Number(stock.quantity || 0) - delta,
            });

            return;
        }

        const restoreQuantity = Math.abs(delta);

        await stockLedgerService.createStockEntry({
            distributor_id,
            variant_id,
            type: "adjustment",
            quantity: restoreQuantity,
            reference_id: dispatch_id,
            note: `Delivery confirmation adjusted for dispatch ${dispatch_id}`,
        });

        if (!stock) {
            await stockRepository.create({
                distributor_id,
                variant_id,
                quantity: restoreQuantity,
            });
            return;
        }

        await stockRepository.update(String(stock._id), {
            quantity: Number(stock.quantity || 0) + restoreQuantity,
        });
    }

    async createDispatch(data: any) {
        const orderIds = Array.isArray(data.order_ids) ? data.order_ids : [];
        if (!data.vehicle_id || !data.driver_id || !orderIds.length) {
            throw new Error("vehicle_id, driver_id and order_ids are required");
        }

        const vehicle = await vehicleRepository.findById(data.vehicle_id);
        const driver = await driverRepository.findById(data.driver_id);

        if (!vehicle || !driver) {
            throw new Error("Vehicle or driver not found");
        }

        // Create a single delivery (dispatch) for the whole save action. All
        // selected orders — even across different outlets — are grouped under it.
        const dispatch = await dispatchRepository.create({
            dispatch_date: new Date(),
            vehicle_number: vehicle.vehicle_number,
            driver_name: driver.name,
            beat_id: data.beat_id,
            status: "dispatched",
        });

        for (const orderId of orderIds) {
            const order = await orderRepository.findById(orderId);

            if (!order) {
                throw new Error(`Order not found for ${orderId}`);
            }

            const invoice = await invoiceRepository.findByOrderId(orderId);
            const orderItems = await orderItemRepository.find({ order_id: orderId });

            for (const item of orderItems) {
                await dispatchItemRepository.create({
                    dispatch_id: dispatch._id,
                    order_id: orderId,
                    invoice_id: invoice?._id,
                    outlet_id: order.outlet_id,
                    variant_id: item.variant_id,
                    ordered_qty: item.quantity,
                    dispatched_qty: item.quantity,
                    delivered_qty: 0,
                    short_qty: 0,
                    returned_qty: 0,
                    free_qty: item.free_quantity || 0,
                    price: item.price || 0,
                    status: "dispatched",
                });
            }

            await orderRepository.update(orderId, { status: "dispatched" });
        }

        return dispatch;
    }
    async getDispatches(filter: Record<string, any> = {}) {
        return await dispatchRepository.getDispatchesForTable(filter);
    }
    async getDispatchesForTable(filters: {
        beat_id?: string;
        outlet_id?: string;
        status?: string;
        search?: string;
    } = {}) {
        return await dispatchRepository.getDispatchesForTable(filters);
    }
    async getDispatch(id: string) {
        return await dispatchRepository.findById(id);
    }
    async getDispatchItems(id: string) {
        const existing = await dispatchItemRepository.findByDispatchId(id);
        if (!existing.length) {
            const dispatch = await dispatchRepository.findById(id);
            if (!dispatch) {
                throw new Error("Dispatch not found");
            }

            // Legacy fallback for single-order dispatches created before the
            // multi-order grouping change. New dispatches always have items.
            if (!dispatch.order_id) {
                return [];
            }

            const orderItems = await orderItemRepository.find({ order_id: String(dispatch.order_id) });
            for (const item of orderItems) {
                await dispatchItemRepository.create({
                    dispatch_id: dispatch._id,
                    order_id: dispatch.order_id,
                    invoice_id: dispatch.invoice_id,
                    variant_id: item.variant_id,
                    ordered_qty: item.quantity,
                    dispatched_qty: item.quantity,
                    delivered_qty: 0,
                    short_qty: 0,
                    returned_qty: 0,
                    free_qty: item.free_quantity || 0,
                    price: item.price || 0,
                    status: dispatch.status === "pending" ? "dispatched" : dispatch.status,
                });
            }
        }

        return await dispatchItemRepository.getDispatchItemsWithVariant(id);
    }
    async updateDispatch(id: string, data: any) {
        return await dispatchRepository.update(id, data);
    }
    async deleteDispatch(id: string) {
        return await dispatchRepository.delete(id);
    }
    async updateDispatchStatus(id: string) {
        const dispatch = await dispatchRepository.findById(id);
        if (!dispatch) {
            throw new Error("Dispatch not found");
        }
        dispatch.status = dispatch.status === "pending" ? "dispatched" : "delivered";
        return await dispatchRepository.update(id, { status: dispatch.status });
    }

    async confirmDelivery(id: string, data: any) {
        const dispatch = await dispatchRepository.findById(id);

        if (!dispatch) {
            throw new Error("Dispatch not found");
        }

        const dispatchItems = await dispatchItemRepository.findByDispatchId(id);
        const submittedItems = Array.isArray(data.items) ? data.items : [];

        // A delivery can span multiple orders/outlets, so preload every related
        // order once and resolve distributor / status updates per order.
        const orderIds = [
            ...new Set(
                dispatchItems
                    .map((item: any) => (item.order_id ? String(item.order_id) : ""))
                    .filter(Boolean)
            ),
        ];

        const orderMap = new Map<string, any>();
        for (const orderId of orderIds) {
            const order = await orderRepository.findById(orderId);
            if (order) {
                orderMap.set(orderId, order);
            }
        }

        let allDelivered = true;
        let anyDelivered = false;

        for (const dispatchItem of dispatchItems) {
            const submitted = submittedItems.find(
                (item: any) => String(item.dispatch_item_id) === String(dispatchItem._id)
            );

            if (!submitted) {
                continue;
            }

            const deliveredQty = Number(submitted.delivered_qty ?? dispatchItem.dispatched_qty);
            const shortQty = Number(
                submitted.short_qty ?? Math.max(dispatchItem.dispatched_qty - deliveredQty, 0)
            );

            const nextStatus =
                deliveredQty === 0
                    ? "pending"
                    : shortQty > 0
                        ? "partially_delivered"
                        : "delivered";

            await dispatchItemRepository.update(String(dispatchItem._id), {
                delivered_qty: deliveredQty,
                short_qty: shortQty,
                status: nextStatus,
                remarks: submitted.remarks || "",
            });

            if (deliveredQty > 0) {
                anyDelivered = true;
            }

            const deliveredDelta = deliveredQty - Number(dispatchItem.delivered_qty || 0);

            if (deliveredDelta !== 0) {
                const relatedOrder = orderMap.get(String(dispatchItem.order_id));
                if (relatedOrder) {
                    await this.applyDeliveryStockDelta({
                        distributor_id: String(relatedOrder.distributor_id),
                        variant_id: String(dispatchItem.variant_id),
                        dispatch_id: String(dispatch._id),
                        delta: deliveredDelta,
                    });
                }
            }

            if (shortQty > 0 || deliveredQty !== dispatchItem.dispatched_qty) {
                allDelivered = false;
            }
        }

        const nextDispatchStatus = allDelivered
            ? "delivered"
            : anyDelivered
                ? "partially_delivered"
                : "pending";

        await dispatchRepository.update(id, {
            delivered_date: new Date(),
            receiver_name: data.receiver_name || "",
            remarks: data.remarks || "",
            status: nextDispatchStatus,
        });

        for (const orderId of orderIds) {
            await orderRepository.update(orderId, {
                status: nextDispatchStatus === "delivered" ? "delivered" : "dispatched",
            });
        }

        return await dispatchRepository.findById(id);
    }
}

const dispatchService = new DispatchService();

export default dispatchService;
