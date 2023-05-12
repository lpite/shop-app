import {
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../lib/sequelize";

interface DocumentProductModel
  extends Model<
    InferAttributes<DocumentProductModel>,
    InferCreationAttributes<DocumentProductModel>
  > {
  document_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  document_type: "income" | "sale";
}

export const documentProductModel = sequelize.define<DocumentProductModel>(
  "DocumentProduct",
  {
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.TEXT,
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
    document_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [["income", "sale"]],
      },
    },
  },
  {
    tableName: "document_product",
    timestamps: false,
  }
);
