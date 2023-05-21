import { Sequelize } from "sequelize-typescript";

import { productModel } from "../models/product";
import { incomeDocumentModel } from "../models/incomeDocument";
import {
  incomeDocumentProductModel,
  saleDocumentProductModel,
} from "../models/documentProduct";
import { saleDocumentModel } from "../models/saleDocument";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db/main.db",
  models: [
    productModel,
    incomeDocumentModel,
    saleDocumentModel,
    incomeDocumentProductModel,
    saleDocumentProductModel,
  ],
  logging: false,
});
