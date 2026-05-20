import BaseRepository from "./base.repository";
import stockModel from "../models/stock.model";

class StockRepository extends BaseRepository<any> {
  

  constructor() {
    super(stockModel);
  }

  findByVariant(variantId: string) {
    return this.model.findOne({ variant_id: variantId });
  }

    findByDistributorVariant(distributorId: string, variantId: string) {
    return this.model.findOne({
      distributor_id: distributorId,
      variant_id: variantId
    });
  }
  
  
  
  

}

export default new StockRepository();