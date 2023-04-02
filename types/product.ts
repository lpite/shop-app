export type Product = {
  product_id: number;
  quantity: number;
  isChanged?: boolean;
  isNew?: boolean;
  name: string;
  price: number;
  serverQuantity?: number;
};
