import { request, response } from "express";
import productService from "../services/product.service";

const distId = (req: typeof request): string | null =>
  req.user?.role === "Distributor" && req.user.distributor_id
    ? req.user.distributor_id
    : null;

export const createProduct = async (req = request, res = response) => {
  try {
    const data = { ...req.body };
    const did = distId(req);
    if (did) data.distributor_id = did;
    const product = await productService.createProduct(data);
    res.status(201).json(product);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Product name already exists for this distributor." });
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

export const getProducts = async (req = request, res = response) => {
  try {
    const search = req.query.search?.toString() || "";
    const category_id = req.query.category_id?.toString();
    const filter: Record<string, any> = search
      ? { name: { $regex: search, $options: "i" } }
      : {};
    if (category_id) filter.category_id = category_id;
    const did = distId(req);
    if (did) filter.distributor_id = did;
    const products = await productService.getProducts(filter);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

export const getProductById = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const product = await productService.getProduct(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const did = distId(req);
    if (did && String((product as any).distributor_id) !== did)
      return res.status(403).json({ message: "Forbidden" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

export const updateProduct = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await productService.getProduct(id);
      if (!existing) return res.status(404).json({ message: "Product not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only edit your own products" });
      delete req.body.distributor_id;
    }
    const product = await productService.updateProduct(id, req.body);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Product name already exists for this distributor." });
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

export const deleteProduct = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await productService.getProduct(id);
      if (!existing) return res.status(404).json({ message: "Product not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only delete your own products" });
    }
    const product = await productService.deleteProduct(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

export const updateProductStatus = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await productService.getProduct(id);
      if (!existing) return res.status(404).json({ message: "Product not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "Forbidden" });
    }
    const product = await productService.updateProductStatus(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error updating product status", error });
  }
};
