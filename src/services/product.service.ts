import productRepository from "../repositories/product.repository";
import productModel from "../models/Productmodel";

class ProductService {
  constructor() {
    // One-time cleanup: legacy documents where distributor_id was stored as a
    // plain string (e.g. "" from form) cause a Mongoose CastError during populate.
    // Fix all to null on service init — becomes a no-op once the data is clean.
    productModel
      .updateMany({ distributor_id: { $type: "string" } }, { $set: { distributor_id: null } })
      .catch((err) => console.error("[ProductService] distributor_id cleanup failed:", err));
  }

  async createProduct(data: any) {
    return await productRepository.create(data);
  }

  async getProducts(filter: Record<string, any> = {}) {
    return await productRepository.find(filter, ["distributor_id"]);
  }

  async getProduct(id: string) {
    return await productRepository.findById(id);
  }

  async updateProduct(id: string, data: any) {
    return await productRepository.update(id, data);
  }

  async deleteProduct(id: string) {
    return await productRepository.delete(id);
  }

  async updateProductStatus(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    product.status = product.status === "active" ? "inactive" : "active";
    return await productRepository.update(id, { status: product.status });
  }

}

export default new ProductService();