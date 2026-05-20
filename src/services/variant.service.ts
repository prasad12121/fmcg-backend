import productPriceModel from "../models/productPrice.model";
import variantRepository from "../repositories/variant.repository";
import stockRepository from "../repositories/stock.repository";

class VariantService {
  async createVariant(data: any) {
    return await variantRepository.create(data);
  }

  async getVariants(filter: Record<string, any> = {}) {
    const variants = await variantRepository.find(filter, [
      "product_id",
      "name",
      "unit_id",
    ]);

    //get price for each variant
    const prices = await productPriceModel.find({
      variant_id: { $in: variants.map((v) => v._id) },
    });

    //get stock for each variant
    const stocks = await stockRepository.find({
      variant_id: { $in: variants.map((v) => v._id) },
    });

    //convert prices to map for easy lookup
    const priceMap = new Map(
      prices.map((p: any) => [p.variant_id.toString(), p]),
    );

    const result = variants.map((variant: any) => {
      const price = priceMap.get(variant._id.toString());
      const margin = price?.mrp - price?.retailer_price;

      return {
        _id: variant._id,
        name: variant.name,
        label: `${variant.name} || ${variant.weight}${variant.unit_id?.name} || MRP: ${price?.retailer_price || 0} || sku_code: ${variant.sku_code} || pack_size: ${variant.pack_size}`,
        product_name: variant.product_id?.name,
        weight: variant.weight,
        unit: variant.unit_id?.name,
        distributor_price: price?.distributor_price || 0,
        retailer_price: price?.retailer_price || 0,
        mrp: price?.mrp || 0,
        margin: margin || 0,
        stock:
          stocks.find(
            (s: any) => s.variant_id.toString() === variant._id.toString(),
          )?.quantity || 0,
        scheme_available: false, // This can be calculated based on the scheme logic
        createdOn: variant.createdAt,
        modifiedOn: variant.updatedAt,
        status: variant.status
      };
    });

    return result;
  }

  async getVariant(id: string) {
    return await variantRepository.findById(id);
  }

  async updateVariant(id: string, data: any) {
    return await variantRepository.update(id, data);
  }

  async deleteVariant(id: string) {
    return await variantRepository.delete(id);
  }

  async updateVariantStatus(id: string) {
    const variant = await variantRepository.findById(id);
    if (!variant) {
      throw new Error("Variant not found");
    }
    variant.status = variant.status === "active" ? "inactive" : "active";
    return await variantRepository.update(id, { status: variant.status });
  }
}

export default new VariantService();
