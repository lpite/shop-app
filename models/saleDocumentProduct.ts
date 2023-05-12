import {
  DataTypes,
  InferCreationAttributes,
  CreationOptional,
  InferAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../lib/sequelize";

interface SaleDocumentProductModel
  extends Model<
    InferAttributes<SaleDocumentProductModel>,
    InferCreationAttributes<SaleDocumentProductModel>
  > {
  document_id: number;
  product_id: number;
  price: number;
  quantity: number;
}

export const saleDocumentProductModel = sequelize.define<SaleDocumentProductModel>(
  "SaleDocumentProduct",
  {
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "sale_document_product",
    timestamps: false,
  }
);
