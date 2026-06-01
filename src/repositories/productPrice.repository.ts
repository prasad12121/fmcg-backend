// create a repository for product price model

import BaseRepository from "./base.repository";
import ProductPriceModel from "../models/productPrice.model";

class ProductPriceRepository extends BaseRepository<any> {
    constructor() {
        super(ProductPriceModel);
    }

}

export default new ProductPriceRepository();