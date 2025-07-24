import { Link, useLocation, useParams, useSearchParams } from "wouter";
import { fetcher } from "../utils/fetcher";
import {
	CheckCircle,
	Clock,
	FileText,
	PenLine,
	Save,
	Trash,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ProductImport } from "../components/income-document/product-import";
import Show from "../utils/Show";
import { DocumentInformation } from "../components/income-document/document-information";

const documentData = {
	documentType: "Надходження товарів та послуг",
	number: "000000001",
	date: "15.01.2024",
	time: "14:30:25",
	organization: 'ООО "ТехКорп"',
	counterparty: 'ООО "Клиент Компани"',
	contract: "Основной договор от 01.01.2024",
	warehouse: "Основной склад",
	currency: "RUB",
	responsible: "Иванов И.И.",
	comment: "Реализация товаров по договору",
	posted: true,

	// Tabular section - Products
	products: [
		{
			id: 1,
			nomenclature: 'Программное обеспечение "1С:Предприятие"',
			characteristic: "Базовая версия",
			unit: "шт",
			quantity: 5,
			price: 25000.0,
			amount: 125000.0,
			vatRate: 20,
			vatAmount: 25000.0,
			total: 150000.0,
		},
		{
			id: 2,
			nomenclature: "Услуги технической поддержки",
			characteristic: "Годовое обслуживание",
			unit: "услуга",
			quantity: 1,
			price: 50000.0,
			amount: 50000.0,
			vatRate: 20,
			vatAmount: 10000.0,
			total: 60000.0,
		},
		{
			id: 3,
			nomenclature: "Обучение пользователей",
			characteristic: "Базовый курс",
			unit: "час",
			quantity: 16,
			price: 2500.0,
			amount: 40000.0,
			vatRate: 20,
			vatAmount: 8000.0,
			total: 48000.0,
		},
	],

	// Totals
	totalQuantity: 22,
	totalAmount: 215000.0,
	totalVAT: 43000.0,
	totalWithVAT: 258000.0,
};

const setIsPosted = (m: any) => true;

interface IncomeDocumentProduct {
	ref: string;
	price: number;
	quantity: number;
	name: string;
	selected?: boolean | null;
}

export interface IncomeDocument {
	number: string;
	date: string;
	posted: boolean;
	products: IncomeDocumentProduct[];
	comment: string;
	supplierRef: string;
	counterPartyRef: string;
	warehouseRef: string;
}

export function IncomeDocument() {
	const [allowEditing, setAllowEditing] = useState(false);
	const { number, date } = useParams();
	const [location, navigate] = useLocation();
	console.log(number, date);
	const isNew = !number || !date;
	const [document, setDocument] = useState<IncomeDocument>({
		products: [],
		number: "",
		date: "",
		posted: false,
		comment: "",
		supplierRef: "",
		counterPartyRef: "",
		warehouseRef: "",
	});

	useEffect(() => {
		if (!isNew) {
			fetcher<IncomeDocument>({
				url: `/shop/hs/api/income-document/11/11`,
				method: "GET",
			}).then((document) => setDocument(document));
		}
	}, []);

	function selectAllRows() {
		// mutateDocument(
		// 	(d) => {
		// 		if (!d?.products || !d.products.map) {
		// 			return d;
		// 		}
		// 		return {
		// 			...d,
		// 			products: d.products?.map((p) => ({ ...p, selected: !p.selected })),
		// 		};
		// 	},
		// 	{
		// 		revalidate: false,
		// 	},
		// );
	}

	function toggleRowSelection(rowIndex: number) {
		// mutateDocument(
		// 	(d) => {
		// 		if (!d?.products || !d?.products[rowIndex]) {
		// 			return d;
		// 		}
		// 		const productsForUpdate = [...d.products];
		// 		productsForUpdate[rowIndex] = {
		// 			...d?.products[rowIndex],
		// 			selected: !d?.products[rowIndex].selected,
		// 		};
		// 		return { ...d, products: productsForUpdate };
		// 	},
		// 	{
		// 		revalidate: false,
		// 	},
		// );
	}

	function setDocumentProducts(products: IncomeDocument["products"]) {
		console.log(products);
		setDocument((d) => ({ ...d, products: products }));
	}
	const [searchParams] = useSearchParams();

	const activeTab = searchParams.get("tab") || "main";

	async function saveDocument() {
		const response = await fetcher<any>({
			method: "POST",
			url: "/shop/odata/standard.odata/Document_ПоступлениеТоваровУслуг?$format=json",
			body: {
				Date: new Date(),
				ДатаПлатежа: new Date(),
				Партнер_Key: document.supplierRef,
				Контрагент_Key: document.counterPartyRef,
				Склад_Key: document.warehouseRef,
				Подразделение_Key: "04dec983-6247-11e3-9715-00e04c395324", // склад
			},
		});
		if (response.Number && response.Date) {
			navigate(`/document-helper/income/${response.Number}/${response.Date}`, {
				replace: true,
			});
		}
		console.log(response);
	}
	console.log(location);

	return (
		<>
			<div className="bg-white border-b-2 border-blue-600">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-4">
							<FileText className="h-8 w-8 text-blue-600" />
							<div>
								<h1 className="text-xl font-bold text-gray-900">
									{documentData.documentType}
								</h1>
								<div className="flex items-center space-x-4 text-sm text-gray-600">
									<span>№ {document?.number || "-"}</span>
									<span>від {document?.date || "-"}</span>
									{document.posted ? (
										<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
											<CheckCircle className="h-3 w-3 mr-1" />
											Проведений
										</span>
									) : (
										<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
											<Clock className="h-3 w-3 mr-1" />
											Не проведений
										</span>
									)}
								</div>
							</div>
						</div>
						<div className="flex space-x-2">
							<button
								onClick={() => setIsPosted(!document.posted)}
								className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-white transition-colors ${
									document?.posted
										? "bg-red-600 hover:bg-red-700"
										: "bg-green-600 hover:bg-green-700"
								}`}
							>
								{document?.posted ? (
									<>
										<XCircle className="h-4 w-4 mr-2" />
										Відмінити проведення
									</>
								) : (
									<>
										<CheckCircle className="h-4 w-4 mr-2" />
										Провести
									</>
								)}
							</button>
							<button
								onClick={saveDocument}
								className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
							>
								<Save className="h-4 w-4 mr-2" />
								Зберегти
							</button>
							<button
								className="flex px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
								onClick={() => setAllowEditing(true)}
							>
								<PenLine size={18} />
								Змінити
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-6 w-full px-48 bg-gray-100 ">
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-8">
						{[
							{ id: "main", label: "Основное" },
							{ id: "products", label: "Товары" },
							{ id: "additional", label: "Дополнительно" },
							{ id: "import", label: "Іморт" },
						].map((tab) => (
							<Link
								key={tab.id}
								to={`?tab=${tab.id}`}
								className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
									activeTab === tab.id
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								{tab.label}
							</Link>
						))}
					</nav>
				</div>
			</div>

			<main className="px-3 py-2">
				<Show when={activeTab === "main"}>
					<DocumentInformation document={document} setDocument={setDocument} />
				</Show>
				<Show when={activeTab === "products"}>
					<div className="max-w-7xl mx-auto px-4">
						<div className="px-3 pt-4 pb-2">
							<label className="flex gap-2 select-none cursor-pointer">
								<input type="checkbox" onChange={selectAllRows} />
								Обрати усі
							</label>
						</div>
						{document?.products?.map((el, i) => {
							return (
								<div
									key={"document_product_" + i}
									className="border shadow-sm my-2 py-1 px-1 flex items-center gap-2 rounded-md"
								>
									<input
										type="checkbox"
										className="ml-2"
										onChange={() => toggleRowSelection(i)}
										checked={el.selected}
									/>
									{/*<span className="flex-1">{el.productName}</span>*/}

									<span className="flex-1">{el.name}</span>
									<span>{el.quantity}</span>
									<button
										className="text-red-500 hover:bg-gray-200 p-2 rounded-md disabled:bg-gray-200 disabled:text-gray-700"
										disabled={!allowEditing}
									>
										<Trash size={20} />
									</button>
								</div>
							);
						})}
					</div>
				</Show>
				<Show when={activeTab === "import"}>
					<ProductImport setDocumentProducts={setDocumentProducts} />
				</Show>
			</main>
		</>
	);
}
