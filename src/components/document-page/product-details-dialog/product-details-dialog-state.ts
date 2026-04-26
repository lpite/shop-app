import { Dispatch, SetStateAction } from "react";
import { FTSProduct } from "../../../types/product";

class ProductDetailsState {
	//@ts-expect-error its okay.
	private changeOpenState: Dispatch<SetStateAction<boolean>>;
	//@ts-expect-error its okay.
	private productState: Dispatch<SetStateAction<FTSProduct | undefined>>;

	register(s: typeof this.changeOpenState, p: typeof this.productState) {
		this.changeOpenState = s;
		this.productState = p;
	}

	openPopup(product: FTSProduct) {
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

export const ProductDetailsDialog = new ProductDetailsState();
