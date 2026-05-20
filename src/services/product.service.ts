import productRepository from "../repositories/product.repository";

class ProductService {

  async createProduct(data: any) {
    return await productRepository.create(data);
  }

  async getProducts(filter: Record<string, any> = {}) {
    return await productRepository.find(filter);
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