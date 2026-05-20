import BaseRepository from "./base.repository";
import orderModel from "../models/order.model";
import orderItemModel from "../models/orderItems.model";

import mongoose from "mongoose";

class OrderRepository extends BaseRepository<any> {
  constructor() {
    super(orderModel);
  }

  //get products in an order
  async getProductsInOrder(orderId: string) {
    const objectId = new mongoose.Types.ObjectId(orderId);

    const products = await orderItemModel.find({ order_id: objectId }).populate({
      path: "variant_id",
      select: "name sku_code pack_size unit_id weight status"
    }).select("variant_id quantity free_quantity price")
      .lean();

    const order = await orderModel
      .findById(objectId)
      .select("order_number status order_date")
      .lean();

    const formattedProducts = products.map((item) => ({
      variant: item.variant_id,
      quantity: item.quantity,
      free_quantity: item.free_quantity,
      price: item.price,
    }));

    return {
      order: order,
      products: formattedProducts,
    };
  }



  async getOrderWithItems(orderId: string) {
    const objectId = new mongoose.Types.ObjectId(orderId);

    return await this.model.aggregate([
      {
        $match: { _id: objectId },
      },

      // 🔹 Join order_items
      {
        $lookup: {
          from: "orderitems", // collection name
          localField: "_id",
          foreignField: "order_id",
          as: "items",
        },
      },

      // 🔹 Unwind items
      {
        $unwind: {
          path: "$items",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 🔹 Join variant
      {
        $lookup: {
          from: "variants", // your variant collection name
          localField: "items.variant_id",
          foreignField: "_id",
          as: "variant",
        },
      },


      // 🔹 Join productprices (FIXED)
      {
        $lookup: {
          from: "productprices",
          let: { variantId: "$items.variant_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$variant_id", "$$variantId"],
                },
              },
            },
            {
              $project: {
                price: 1,
                retailer_price: 1,
              },
            },
          ],
          as: "product_price",
        },
      },

      {
        $unwind: {
          path: "$product_price",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $unwind: {
          path: "$variant",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 🔹 Format item
      {
        $project: {
          order_number: 1,
          outlet_id: 1,
          distributor_id: 1,
          status: 1,
          order_date: 1,
          gst: 1,
          total_discount: 1,
          total_tax: 1,
          grand_total: 1,
          subtotal: 1,

          items: {
            quantity: "$items.quantity",
            // fallback + cast (optional)
            price: {
              $toDouble: {
                $ifNull: ["$product_price.retailer_price", 0],
              },
            },
            variant_id: {
              _id: "$variant._id",
              name: "$variant.name",
            },
          },
        },
      },

      // 🔹 Join outlet
      {
        $lookup: {
          from: "outlets",
          localField: "outlet_id",
          foreignField: "_id",
          as: "outlet",
        },
      },
      // 🔹 Join distributor
      {
        $lookup: {
          from: "distributors",
          localField: "distributor_id",
          foreignField: "_id",
          as: "distributor",
        },
      },
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "order_id",
          as: "invoice",
        },
      },
      // 🔹 Unwind outlet
      {
        $unwind: {
          path: "$outlet",
          preserveNullAndEmptyArrays: true,
        },
      },
      // 🔹 Unwind distributor
      {
        $unwind: {
          path: "$distributor",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$invoice",
          preserveNullAndEmptyArrays: true,
        },
      },
      // 🔹 Group back
      {
        $group: {
          _id: "$_id",
          order_number: { $first: "$order_number" },
          invoice_id: { $first: "$invoice._id" },
          invoice_number: { $first: "$invoice.invoice_number" },
          outlet_name: { $first: "$outlet.name" },
          outlet_id: { $first: "$outlet_id" },
          distributor_name: { $first: "$distributor.name" },
          distributor_id: { $first: "$distributor_id" },
          status: { $first: "$status" },
          order_date: { $first: "$order_date" },
          gst: { $first: "$gst" },
          total_discount: { $first: "$total_discount" },
          total_tax: { $first: "$total_tax" },
          grand_total: { $first: "$grand_total" },
          subtotal: { $first: "$subtotal" },
        },
      },
    ]);
  }

  async updateOrderWithOrderItems(id: string, data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    let updatedOrder: any;
  
    try {
      // ✅ Update order
      updatedOrder = await this.model.findByIdAndUpdate(
        id,
        {
          subtotal: data.subtotal,
          gst: data.gst,
          total_discount: data.total_discount || 0,
          total_tax: data.total_tax || 0,
          grand_total: data.grand_total,
        },
        { new: true, session }
      );
  
      if (!updatedOrder) {
        throw new Error("Order not found");
      }
  
      // ✅ Delete old items
      await orderItemModel.deleteMany(
        { order_id: id },
        { session }
      );
  
      // ✅ IMPORTANT FIX HERE
      if (!data.products || !data.products.length) {
        throw new Error("Products are required");
      }
  
      const newOrderItems = data.products.map((item: any) => {
        if (!item.variant_id) {
          throw new Error("variant_id missing");
        }
  
        return {
          order_id: id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
        };
      });
  
      // ✅ Insert new items
      await orderItemModel.insertMany(newOrderItems, {
        session,
          });
      
          await session.commitTransaction();
          return updatedOrder;
      
    } catch (error) {
      await session.abortTransaction();
      console.error("UPDATE ORDER ERROR:", error); // 🔥 VERY IMPORTANT
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getDispatchReadyOrders(filters: {
    beat_id?: string;
    outlet_id?: string;
  } = {}) {
    const pipeline: any[] = [
      {
        $lookup: {
          from: "outlets",
          localField: "outlet_id",
          foreignField: "_id",
          as: "outlet",
        },
      },
      {
        $unwind: {
          path: "$outlet",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "beats",
          localField: "outlet.beat_id",
          foreignField: "_id",
          as: "beat",
        },
      },
      {
        $unwind: {
          path: "$beat",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "order_id",
          as: "invoice",
        },
      },
      {
        $unwind: {
          path: "$invoice",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const matchStage: Record<string, any> = {
      status: { $in: ["approved", "invoiced"] },
    };

    if (filters.beat_id && mongoose.Types.ObjectId.isValid(filters.beat_id)) {
      matchStage["outlet.beat_id"] = new mongoose.Types.ObjectId(filters.beat_id);
    }

    if (filters.outlet_id && mongoose.Types.ObjectId.isValid(filters.outlet_id)) {
      matchStage.outlet_id = new mongoose.Types.ObjectId(filters.outlet_id);
    }

    pipeline.push(
      { $match: matchStage },
      {
        $project: {
          order_id: "$_id",
          order_number: 1,
          invoice_id: "$invoice._id",
          invoice_number: "$invoice.invoice_number",
          outlet_id: "$outlet._id",
          outlet_name: "$outlet.name",
          beat_id: "$beat._id",
          beat_name: "$beat.name",
          status: 1,
          order_date: 1,
          createdAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      }
    );

    return await this.model.aggregate(pipeline).exec();
  }

}

export default new OrderRepository();
