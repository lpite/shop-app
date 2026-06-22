import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";

// Types for your 1C OData responses
interface ODataBarcodeRecord {
	Штрихкод: string;
	Номенклатура_Key: string;
	Характеристика_Key: string;
	Упаковка_Key: string;
}

interface Product {
	ref: string;
	searchCode: string;
	name: string;
	code: string;
}

export default function ScannerPage() {
	const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
	const [scanHistory, setScanHistory] = useState<string[]>([]);

	// --- State for Search/Associate Dialog ---
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// --- State for the "Found Product" Dialog ---
	const [isFoundDialogOpen, setIsFoundDialogOpen] = useState(false);
	const [foundProductDetails, setFoundProductDetails] = useState<{
		product: Product;
		oDataRecord: ODataBarcodeRecord;
	} | null>(null);

	const { data: products } = useSWR(
		"app/product",
		() =>
			fetcher<Product[]>({
				url: `/shop/hs/app/product`,
				method: "GET",
			}),
		{ revalidateOnFocus: false },
	);

	const handleScan = async (scannedCode: string) => {
		console.log("Detected scan:", scannedCode);
		setLastScannedCode(scannedCode);
		setScanHistory((prev) => [...prev, scannedCode]);

		try {
			// 1. Check if the barcode already exists in the registry
			const existingBarcodeData = await fetcher<{
				value: ODataBarcodeRecord[];
			}>({
				url: `/shop/odata/standard.odata/InformationRegister_ШтрихкодыНоменклатуры?$format=json&$filter=Штрихкод eq '${scannedCode}'`,
				method: "GET",
			});

			// 2. If it exists, open the "Found Product" dialog
			if (existingBarcodeData.value && existingBarcodeData.value.length > 0) {
				const oDataRecord = existingBarcodeData.value[0];
				const productRef = oDataRecord.Номенклатура_Key;

				// Try to find the human-readable name from SWR data
				const matchedProduct = products?.find((p) => p.ref === productRef) || {
					name: "Невідомий товар (не знайдено в базі)",
					code: "N/A",
					ref: productRef,
					searchCode: "",
				};

				setFoundProductDetails({
					product: matchedProduct,
					oDataRecord: oDataRecord,
				});

				setIsFoundDialogOpen(true);
				return;
			}

			// 3. If it doesn't exist, proceed to open the standard association dialog
			setSearchQuery("");
			setIsDialogOpen(true);
		} catch (error) {
			console.error("Failed to check barcode existence:", error);
			toast.error("Помилка при перевірці штрихкоду");
		}
	};

	useBarcodeScanner(handleScan);

	const filteredProducts =
		products?.filter((product) => {
			if (!searchQuery) return false;
			const lowerQuery = searchQuery.toLowerCase();
			return (
				product.name?.toLowerCase().includes(lowerQuery) ||
				product.code?.toLowerCase().includes(lowerQuery) ||
				product.searchCode?.toLowerCase().includes(lowerQuery)
			);
		}) || [];

	// --- Action: Associate barcode to a new product ---
	const handleAssociate = async (product: Product) => {
		try {
			await fetcher({
				url: "/shop/odata/standard.odata/InformationRegister_ШтрихкодыНоменклатуры?$format=json",
				method: "POST",
				body: {
					Номенклатура_Key: product.ref,
					Штрихкод: lastScannedCode,
				},
			});
			toast.success("Привʼязано успішно");
			setIsDialogOpen(false);
		} catch (error) {
			console.error("Association failed:", error);
			toast.error("Помилка при привʼязці");
		}
	};

	// --- Action: Delete existing barcode association ---
	const handleDeleteBarcode = async () => {
		if (!foundProductDetails || !lastScannedCode) return;

		try {
			const { Номенклатура_Key, Характеристика_Key, Упаковка_Key } =
				foundProductDetails.oDataRecord;

			// 1C OData requires specifying all composite keys (dimensions) for a DELETE on an Information Register
			const deleteUrl = `/shop/odata/standard.odata/InformationRegister_ШтрихкодыНоменклатуры(Штрихкод='${lastScannedCode}',Номенклатура_Key=guid'${Номенклатура_Key}',Характеристика_Key=guid'${Характеристика_Key}',Упаковка_Key=guid'${Упаковка_Key}')?$format=json`;

			await fetcher({
				url: deleteUrl,
				method: "DELETE",
			});

			toast.success("Штрихкод видалено");
			setIsFoundDialogOpen(false);
		} catch (error) {
			console.error("Deletion failed:", error);
			toast.error("Помилка при видаленні");
		}
	};

	// --- Action: Close found dialog and open search dialog ---
	const handleAttachToAnother = () => {
		setIsFoundDialogOpen(false);
		setSearchQuery("");
		// Add a tiny delay to allow the first dialog to close smoothly before opening the next
		setTimeout(() => {
			setIsDialogOpen(true);
		}, 100);
	};

	return (
		<main>
			<div style={{ padding: "20px", fontFamily: "sans-serif" }}>
				<h2>Inventory Scanner</h2>

				<p>
					<strong>Last Scanned: </strong>
					{lastScannedCode ? lastScannedCode : "Waiting for scan..."}
				</p>

				<input type="text" placeholder="Manual search..." />

				<h3>History:</h3>
				<ul>
					{scanHistory.map((code, index) => (
						<li key={index}>{code}</li>
					))}
				</ul>
			</div>

			{/* ================================================================= */}
			{/* DIALOG 1: PRODUCT ALREADY FOUND FOR THIS BARCODE                  */}
			{/* ================================================================= */}
			<Dialog.Root open={isFoundDialogOpen} onOpenChange={setIsFoundDialogOpen}>
				<Dialog.Portal>
					<Dialog.Overlay
						style={{
							backgroundColor: "rgba(0,0,0,0.5)",
							position: "fixed",
							inset: 0,
						}}
					/>
					<Dialog.Content
						style={{
							backgroundColor: "white",
							borderRadius: "8px",
							padding: "24px",
							position: "fixed",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							width: "90vw",
							maxWidth: "450px",
							display: "flex",
							flexDirection: "column",
							boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
						}}
					>
						<Dialog.Title
							style={{
								margin: "0 0 10px 0",
								fontSize: "1.2rem",
								color: "#16a34a",
							}}
						>
							Товар знайдено
						</Dialog.Title>
						<Dialog.Description style={{ marginBottom: "20px", color: "#666" }}>
							Цей штрихкод вже прив'язаний до товару:
						</Dialog.Description>

						<div
							style={{
								padding: "16px",
								backgroundColor: "#f4f4f5",
								borderRadius: "6px",
								marginBottom: "24px",
							}}
						>
							<div
								style={{
									fontSize: "1.2rem",
									fontWeight: "bold",
									marginBottom: "8px",
								}}
							>
								{foundProductDetails?.product.name}
							</div>
							<div style={{ color: "#666", fontSize: "0.9rem" }}>
								Артикул: {foundProductDetails?.product.code}
							</div>
							<div
								style={{
									marginTop: "12px",
									fontSize: "1.5rem",
									fontWeight: "bold",
									letterSpacing: "2px",
									borderTop: "1px solid #e4e4e7",
									paddingTop: "12px",
								}}
							>
								{lastScannedCode}
							</div>
						</div>

						<div
							style={{ display: "flex", flexDirection: "column", gap: "12px" }}
						>
							<button
								onClick={handleAttachToAnother}
								style={{
									padding: "12px",
									cursor: "pointer",
									backgroundColor: "#2563eb",
									color: "white",
									border: "none",
									borderRadius: "4px",
									fontWeight: "bold",
								}}
							>
								Прив'язати до іншого товару
							</button>
							<button
								onClick={handleDeleteBarcode}
								style={{
									padding: "12px",
									cursor: "pointer",
									backgroundColor: "#ef4444",
									color: "white",
									border: "none",
									borderRadius: "4px",
									fontWeight: "bold",
								}}
							>
								Видалити цей штрихкод
							</button>
							<Dialog.Close asChild>
								<button
									style={{
										padding: "12px",
										cursor: "pointer",
										backgroundColor: "#e4e4e7",
										border: "none",
										borderRadius: "4px",
									}}
								>
									Скасувати
								</button>
							</Dialog.Close>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>

			{/* ================================================================= */}
			{/* DIALOG 2: SEARCH AND ASSOCIATE NEW BARCODE                        */}
			{/* ================================================================= */}
			<Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<Dialog.Portal>
					<Dialog.Overlay
						style={{
							backgroundColor: "rgba(0, 0, 0, 0.5)",
							position: "fixed",
							inset: 0,
						}}
					/>
					<Dialog.Content
						style={{
							backgroundColor: "white",
							borderRadius: "8px",
							padding: "24px",
							position: "fixed",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							width: "90vw",
							maxWidth: "500px",
							maxHeight: "85vh",
							display: "flex",
							flexDirection: "column",
							boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
						}}
					>
						<Dialog.Title style={{ margin: "0 0 10px 0", fontSize: "1.2rem" }}>
							Прив'язати штрихкод
						</Dialog.Title>
						<Dialog.Description style={{ marginBottom: "20px", color: "#666" }}>
							Знайдіть товар для прив'язки сканованого коду.
						</Dialog.Description>

						<div
							style={{
								fontSize: "2.5rem",
								fontWeight: "bold",
								textAlign: "center",
								letterSpacing: "4px",
								padding: "20px",
								backgroundColor: "#f4f4f5",
								borderRadius: "6px",
								marginBottom: "20px",
							}}
						>
							{lastScannedCode}
						</div>

						<input
							type="text"
							placeholder="Пошук за назвою або артикулом..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							autoFocus
							style={{
								padding: "12px",
								fontSize: "1rem",
								borderRadius: "4px",
								border: "1px solid #ccc",
								marginBottom: "16px",
							}}
						/>

						<div
							style={{
								overflowY: "auto",
								flex: 1,
								borderTop: "1px solid #eee",
							}}
						>
							{filteredProducts.length === 0 ? (
								<p style={{ padding: "10px", color: "#999" }}>
									Товари не знайдені.
								</p>
							) : (
								<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
									{filteredProducts.slice(0, 100).map((product) => (
										<li
											key={product.code}
											onClick={() => handleAssociate(product)}
											style={{
												padding: "12px",
												borderBottom: "1px solid #eee",
												cursor: "pointer",
												display: "flex",
												justifyContent: "space-between",
											}}
											onMouseEnter={(e) =>
												(e.currentTarget.style.backgroundColor = "#f9f9f9")
											}
											onMouseLeave={(e) =>
												(e.currentTarget.style.backgroundColor = "transparent")
											}
										>
											<span>
												<strong>{product.name}</strong>
											</span>
											<span style={{ color: "#666" }}>{product.code}</span>
										</li>
									))}
								</ul>
							)}
						</div>

						<div style={{ marginTop: "20px", textAlign: "right" }}>
							<Dialog.Close asChild>
								<button
									style={{
										padding: "8px 16px",
										cursor: "pointer",
										backgroundColor: "#e4e4e7",
										border: "none",
										borderRadius: "4px",
									}}
								>
									Скасувати
								</button>
							</Dialog.Close>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</main>
	);
}
