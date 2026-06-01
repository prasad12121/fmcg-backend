// create a service for product price model

import productPriceRepository from "../repositories/productPrice.repository";

class ProductPriceService {


    async createProductPrice(data: any) {
        return await productPriceRepository.create(data);
    }
    async getProductPrice(filter: Record<string, any> = {}) {
        return await productPriceRepository.find(filter);
    }
    async updateProductPrice(id: string, data: any) {
        return await productPriceRepository.update(id, data);
    }

    async getProductPriceById(id: string) {
        return await productPriceRepository.findById(id);
    }
    async deleteProductPrice(id: string) {
        return await productPriceRepository.delete(id);
    }
}


export default new ProductPriceService();