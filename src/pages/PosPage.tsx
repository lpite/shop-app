import React, { useRef } from "react";
import { useAppStore } from "../stores/useAppStore";
import CartSection from "../components/document-page/cart-section";
import ProductsSection from "../components/document-page/products-section";
import Header from "../components/document-page/header";
import ProductDetailsPopup from "../components/document-page/product-details/popup";
import { useSearch } from "../hooks/useSearch";

export default function PosPage() {
	const pageRef = useRef<HTMLDivElement>(null);

	const { data: products, isLoading: isLoadingProducts, error } = useSearch({});

	const resize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
		useAppStore.setState((state) => {
			if (state.isResizing) {
				const pageHeight = pageRef?.current?.clientHeight || 0;
				const newHeigh = state.startCartHeight + (state.startY - e.clientY);
				if (newHeigh < 200 || pageHeight - newHeigh < 300) {
					return {};
				}

				return { cartHeight: newHeigh };
			}
			return { ...state };
		});

	const endResize = () =>
		useAppStore.setState(() => ({
			isResizing: false,
		}));

	return (
		<div
			className="h-full overflow-hidden flex flex-col"
			onMouseUp={endResize}
			onMouseMove={resize}
			ref={pageRef}
		>
			<ProductDetailsPopup />
			{isLoadingProducts ? (
				<div className="fixed z-10 start-0 top-0 end-0 right-0 bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
					<div className="w-24 h-24 border-8 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
				</div>
			) : null}

			<Header />
			<main className="flex flex-col overflow-hidden">
				<ProductsSection
					items={products || []}
					isLoading={isLoadingProducts}
					pageWidth={pageRef.current?.clientWidth}
					error={error}
				/>
				<CartSection />
			</main>
		</div>
	);
}
