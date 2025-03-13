import React, { useRef, useState } from "react";
import { useAppStore } from "../stores/useAppStore";
import CartSection from "../components/document-page/cart-section";
import { Product } from "../types/product";
import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import ProductsSection from "../components/document-page/products-section";
import Header from "../components/document-page/header";
import ProductDetailsPopup from "../components/document-page/product-details/popup";

export default function DocumentPage() {
	const pageRef = useRef<HTMLDivElement>(null);

	const { isLoading: isLoadingProducts, isValidating: isValidatingProducts } =
		useSWR(
			"/products/",
			() =>
				fetcher<Product[]>({
					url: "/shop/hs/app/product/",
					method: "GET",
				}),
			{
				revalidateOnFocus: false,
				revalidateOnMount: false,
				revalidateIfStale: false,
				revalidateOnReconnect: false,
			},
		);

	const resize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
		useAppStore.setState((state) => {
			if (state.isResizing) {
				const pageHeight = pageRef?.current?.clientHeight || 0;
				const newHeigh = state.startCartHeight + (state.startY - e.clientY);
				if (newHeigh < 100 || pageHeight - newHeigh < 200) {
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

	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

	return (
		<div
			className="h-full overflow-hidden flex flex-col"
			onMouseUp={endResize}
			onMouseMove={resize}
			ref={pageRef}
		>
			<ProductDetailsPopup />
			{isLoadingProducts ? (
				<div className="fixed start-0 top-0 end-0 right-0 bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
					<div className="w-24 h-24 border-8 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
				</div>
			) : null}

			<Header setFilteredProducts={setFilteredProducts} />
			<main className="h-full shrink flex flex-col">
				<ProductsSection
					filteredProducts={filteredProducts}
					isValidatingProducts={isValidatingProducts}
					isLoadingProducts={isLoadingProducts}
					pageRef={pageRef}
				/>
				<CartSection />
			</main>
		</div>
	);
}
