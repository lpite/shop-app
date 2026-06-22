import { Dispatch, SetStateAction } from "react";

class BarcodeState {
	//@ts-expect-error its okay.
	private changeOpenState: Dispatch<SetStateAction<boolean>>;
	//@ts-expect-error its okay.
	private barcodeState: Dispatch<SetStateAction<string | undefined>>;

	register(s: typeof this.changeOpenState, b: typeof this.barcodeState) {
		this.changeOpenState = s;
		this.barcodeState = b;
	}

	openPopup(barcode: string) {
		if (this.changeOpenState) {
			this.changeOpenState(true);
			this.barcodeState(barcode);
		} else {
			console.error("something wrong ");
		}
	}
	closePopup() {
		if (this.changeOpenState) {
			this.changeOpenState(false);
		} else {
			console.error("something wrong");
		}
	}
}

export const BarcodeDialog = new BarcodeState();
