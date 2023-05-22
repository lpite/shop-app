import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";

import { DataTypes, Optional } from "sequelize";

export interface ProductModel {
  product_id: number;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  quantity?: number;
}
interface ProductCreationAttributes
  extends Optional<
    ProductModel,
    "product_id" | "price" | "createdAt" | "updatedAt"
  > {}

@Table({
  tableName: "product",
})
export class productModel extends Model<
  ProductModel,
  ProductCreationAttributes
> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
  })
  product_id!: number;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  name!: string;

  @Column price!: number;
  
  @CreatedAt
  @Column
  createdAt!: Date;

  @UpdatedAt
  @Column
  updatedAt!: Date;
}
