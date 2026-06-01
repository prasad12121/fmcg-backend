// create a controller for product price model

import { request, response } from "express";
import productPriceService from "../services/productPrice.service";
import productPriceRepository from "../repositories/productPrice.repository";

export const createProductPrice = async (req = request, res = response) => {
  try {
    const productPrice = await productPriceService.createProductPrice(req.body);
    res.status(201).json(productPrice);
  } catch (error) {
    res.status(500).json({ message: "Error creating product price", error });
  }
};


export const getProductPrice = async (req = request, res = response) => {
  try {
    const productPrice = await productPriceService.getProductPrice(req.query);
    res.status(200).json(productPrice);
  } catch (error) {
    res.status(500).json({ message: "Error getting product price", error });
  }
};


export const updateProductPrice = async (req = request, res = response) => {

    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const productPrice = await productPriceService.updateProductPrice(id, req.body);
        res.status(200).json(productPrice);

    } catch (error) {
        res.status(500).json({ message: "Error updating product price", error });
    }
};


export const deleteProductPrice = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const productPrice = await productPriceService.deleteProductPrice(id);
        res.status(200).json(productPrice);
    } catch (error) {
        res.status(500).json({ message: "Error deleting product price", error });
    }
};



