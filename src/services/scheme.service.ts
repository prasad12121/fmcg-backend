
import schemeProductRepository from "../repositories/scheme.repository";

class SchemeService {

 async applyScheme(variantId: string, quantity: number){

   const scheme =
     await schemeProductRepository.findByVariant(variantId);

   if(!scheme){
     return {freeQty:0,price:10};
   }

   const freeQty =
     Math.floor(quantity / scheme.buy_qty) * scheme.free_qty;

   return {
     freeQty,
     price:scheme.price
   };

 }

}

export default new SchemeService();