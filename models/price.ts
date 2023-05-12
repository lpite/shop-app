import {
  DataTypes,
  InferCreationAttributes,
  CreationOptional,
  InferAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../lib/sequelize";

interface PriceModel
  extends Model<
    InferAttributes<PriceModel>,
    InferCreationAttributes<PriceModel>
  > {
  price_id: CreationOptional<number>;
  product_id: number;
  price: number;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

export const priceModel = sequelize.define<PriceModel>(
  "Price",
  {
    price_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique:true,
    },
    price: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "price",
    timestamps: true,
  }
);

