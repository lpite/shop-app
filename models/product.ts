import {
  DataTypes,
  InferCreationAttributes,
  CreationOptional,
  InferAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../lib/sequelize";

export interface ProductModel
  extends Model<
    InferAttributes<ProductModel>,
    InferCreationAttributes<ProductModel>
  > {
  product_id: CreationOptional<number>;
  name: string;
  price:CreationOptional<number>;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

export const productModel = sequelize.define<ProductModel>(
  "Product",
  {
    // Model attributes are defined here
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.REAL,
      defaultValue:0
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "product",
    timestamps: true,
  }
);
