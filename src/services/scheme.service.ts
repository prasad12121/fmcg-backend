import schemeRepository from "../repositories/scheme.repository";
import SchemeProduct from "../models/schemeProduct.model";

class SchemeService {
  async createScheme(body: Record<string, unknown>) {
    const { products = [], ...schemeData } = body as {
      products?: Array<Record<string, unknown>>;
      [key: string]: unknown;
    };

    const scheme = await schemeRepository.create(schemeData);

    if (Array.isArray(products) && products.length > 0) {
      await SchemeProduct.insertMany(
        products.map((item) => ({
          ...item,
          scheme_id: scheme._id,
        }))
      );
    }

    return this.getSchemeById(String(scheme._id));
  }

  async getSchemes(filter: Record<string, unknown> = {}) {
    return schemeRepository.find(filter, ["distributor_id"]);
  }

  async getSchemeById(id: string) {
    const scheme = await schemeRepository.findById(id);
    if (!scheme) {
      return null;
    }

    const products = await SchemeProduct.find({ scheme_id: id }).populate(
      "variant_id",
      "name sku_code"
    );

    return {
      ...scheme.toObject(),
      products,
    };
  }

  async applyScheme(variantId: string, quantity: number) {
    const schemeProduct = await SchemeProduct.findOne({
      variant_id: variantId,
    }).populate("scheme_id");

    if (!schemeProduct) {
      return { freeQty: 0, price: null };
    }

    const scheme = schemeProduct.scheme_id as {
      status?: string;
      type?: string;
    } | null;

    if (!scheme || scheme.status !== "active") {
      return { freeQty: 0, price: null };
    }

    if (scheme.type === "BUY_X_GET_Y") {
      const buyQty = Number(schemeProduct.buy_qty) || 1;
      const freeQtyPerSet = Number(schemeProduct.free_qty) || 0;
      const freeQty = Math.floor(quantity / buyQty) * freeQtyPerSet;
      return { freeQty, price: null };
    }

    return { freeQty: 0, price: null };
  }

  async updateScheme(id: string, data: Record<string, unknown>) {
    const { products, ...schemeData } = data as {
      products?: Array<Record<string, unknown>>;
      [key: string]: unknown;
    };

    const updated = await schemeRepository.update(id, schemeData);
    if (!updated) {
      return null;
    }

    if (products !== undefined) {
      await SchemeProduct.deleteMany({ scheme_id: id });
      if (Array.isArray(products) && products.length > 0) {
        await SchemeProduct.insertMany(
          products.map((item) => ({
            ...item,
            scheme_id: id,
          }))
        );
      }
    }

    return this.getSchemeById(id);
  }

  async deleteScheme(id: string) {
    await SchemeProduct.deleteMany({ scheme_id: id });
    return schemeRepository.delete(id);
  }

  async updateSchemeStatus(id: string, body: { status?: string }) {
    return schemeRepository.update(id, { status: body.status });
  }
}

export default new SchemeService();
