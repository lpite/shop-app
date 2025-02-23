import { Dispatch, SetStateAction } from "react";
import { Product } from "../../../types/product";

class PopupState {
  //@ts-expect-error its okay.
  private changeOpenState: Dispatch<SetStateAction<boolean>>;
  //@ts-expect-error its okay.
  private productState: Dispatch<SetStateAction<Product | undefined>>;

  register(s: typeof this.changeOpenState, p: typeof this.productState) {
    this.changeOpenState = s;
    this.productState = p;
  }

  openPopup(product: Product) {
    if (this.changeOpenState) {
      this.changeOpenState(true);
      this.productState(product);
    } else {
      console.error("something wrong ");
    }
  }
  closePopup() {
    if (this.changeOpenState) {
      this.changeOpenState(false);
      this.productState(undefined);
    } else {
      console.error("something wrong");
    }
  }
}

export const State = new PopupState();
