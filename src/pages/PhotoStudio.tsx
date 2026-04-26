import useSWR from "swr";
import {
	Download,
	Eye,
	Plus,
	RefreshCw,
	Save,
	SendHorizonal,
	Upload,
	X,
} from "lucide-react";
import { useConfig } from "../stores/config-store";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import { fetcher } from "../utils/fetcher";
import { CMDK } from "../components/cmdk";
import { useDebounce } from "@uidotdev/usehooks";

const photoStatuses = ["new", "ready", "junk", "maybe", "uploaded"] as const;

type PhotoStatus = "new" | "ready" | "junk" | "maybe" | "uploaded";

type Photo = { id: string; file: string; status: PhotoStatus };
type Product = {
	ref: string;
	searchCode: string;
	name: string;
};

export default function PhotoStudio() {
	const { pb_base_url } = useConfig();

	// const [filterStatus, setFilterStatus] = useState(null);
	const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [showAddPhotosDialog, setShowAddPhotosDialog] =
		useState<boolean>(false);

	const { data: photos, mutate: updatePhotos } = useSWR(
		"pb/photo_product_link",
		() =>
			fetch(
				`${pb_base_url}/api/collections/photo_agg/records?sort=-created&perPage=100`,
			)
				.then((r) => r.json())
				.then((r) => r.items) as Promise<
				{
					product_ref: string;
					photos: Photo[];
				}[]
			>,
	);

	// const { data: products } = useSWR(
	// 	"app/product",
	// 	() =>
	// 		fetcher({
	// 			url: `/shop/hs/app/product`,
	// 			method: "GET",
	// 		}) as Promise<
	// 			{ ref: string; name: string; searchCode: string; code: string }[]
	// 		>,
	// 	{ revalidateOnFocus: false },
	// );

	return (
		<main className="p-4">
			<PhotoDialog
				show={selectedPhoto !== null}
				onClose={() => setSelectedPhoto(null)}
				photo={selectedPhoto}
			/>
			<div className="py-2 flex gap-3 sticky top-0 bg-white z-10">
				<AddPhotosDialog
					selectedProduct={selectedProduct}
					setSelectedProduct={setSelectedProduct}
					show={showAddPhotosDialog}
					setShow={setShowAddPhotosDialog}
				/>
				<select className="px-2 rounded-lg cursor-pointer">
					<option>-</option>
					{photoStatuses.map((status) => (
						<option key={status} value={status}>
							{status}
						</option>
					))}
				</select>
				<button
					className="border size-10 flex items-center justify-center rounded-lg hover:shadow-sm"
					onClick={() => updatePhotos()}
				>
					<RefreshCw className="size-4" />
				</button>
			</div>
			<div className="flex justify-center flex-wrap gap-2">
				{photos?.map(({ product_ref, photos }) => (
					<div
						key={product_ref}
						className="flex flex-col border w-full p-2 relative rounded-xl"
					>
						<span className="">
							Назва товару
							{/*{products?.find((p) => p.ref === product_ref)?.name}*/}
						</span>
						<div className="flex gap-2 overflow-hidden">
							{photos.map(({ file, id, status }) => (
								<button
									key={file}
									className="group relative"
									onClick={() => setSelectedPhoto({ file, id, status })}
								>
									<span className="flex items-center justify-center bg-gray-100/55 absolute top-0 start-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 rounded-xl">
										<Eye className="size-10" />
									</span>
									{status === "new" ? (
										<span className="absolute end-1 top-1 size-3 block bg-blue-200 rounded-full"></span>
									) : null}
									{status === "ready" ? (
										<span className="absolute end-1 top-1 size-3 block bg-green-600 rounded-full"></span>
									) : null}
									<img
										className={`w-24 h-24 object-cover rounded-xl`}
										src={`${pb_base_url}/api/files/photo_product_link/${id}/${file}?thumb=192x192`}
									/>
								</button>
							))}
							<button
								className="w-24 h-24 border-2 rounded-xl flex items-center justify-center hover:bg-gray-100"
								onClick={() => {
									setSelectedProduct({
										ref: product_ref,
										searchCode: "",
										name: product_ref,
									});
									setShowAddPhotosDialog(true);
								}}
							>
								<Plus className="text-gray-500" />
							</button>
						</div>
					</div>
				))}
			</div>
		</main>
	);
}

interface PhotoPreview {
	id: string;
	file: File;
	preview: string;
}

type AddPhotosDialogProps = {
	selectedProduct: Product | null;
	setSelectedProduct: (p: Product | null) => void;
	show: boolean;
	setShow: (v: boolean) => void;
};

function AddPhotosDialog({
	selectedProduct,
	setSelectedProduct,
	show,
	setShow,
}: AddPhotosDialogProps) {
	const [photos, setPhotos] = useState<PhotoPreview[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [defaultPhotoStatus, setDefaultPhotoStatus] = useState(
		photoStatuses[0],
	);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isOpenCMDK, setIsOpenCMDK] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const debouncedSearchValue = useDebounce(searchValue, 300);
	const [isSending, setIsSending] = useState(false);
	const { pb_base_url } = useConfig();

	const { data: products } = useSWR(
		"app/product",
		() =>
			fetcher({
				url: `/shop/hs/app/product`,
				method: "GET",
			}) as Promise<
				{ ref: string; name: string; searchCode: string; code: string }[]
			>,
		{ revalidateOnFocus: false },
	);

	const handleFileSelect = (files: FileList | null) => {
		if (!files) return;
		try {
			const newPhotos: PhotoPreview[] = Array.from(files)
				.filter((file) => file.type.startsWith("image/"))
				.map((file) => ({
					id: Math.random().toString(),
					file,
					preview: URL.createObjectURL(file),
				}));
			setPhotos((prev) => [...prev, ...newPhotos]);
		} catch (err) {
			alert(err);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		handleFileSelect(e.dataTransfer.files);
	};

	const removePhoto = (id: string) => {
		setPhotos((prev) => {
			const photo = prev.find((p) => p.id === id);
			if (photo) URL.revokeObjectURL(photo.preview);
			return prev.filter((p) => p.id !== id);
		});
	};

	async function handleSubmit() {
		if (!selectedProduct || photos.length === 0) return;
		setIsSending(true);
		await Promise.all(
			photos.map(async (photo) => {
				const formData = new FormData();
				formData.append("product_ref", selectedProduct.ref);
				formData.append("photo", photo.file);
				formData.append("status", defaultPhotoStatus);

				await fetch(
					`${pb_base_url}/api/collections/photo_product_link/records`,
					{
						method: "POST",
						body: formData,
					},
				).then(async (r) => {
					if (!r.ok) {
						const json = await r.json();
						throw new Error(JSON.stringify(json));
					}
					return;
				});
			}),
		)
			.then(() => {
				setIsSending(false);
				handleClose();
			})
			.catch((err) => {
				console.error(err);
				setIsSending(false);
				alert(err);
			});

		console.log("Uploading:", {
			productId: selectedProduct,
			photos: photos.map((p) => p.file),
		});
	}

	const handleClose = () => {
		photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
		setPhotos([]);
		setSelectedProduct(null);
		setShow(false);
	};

	return (
		<Dialog.Root open={show} onOpenChange={setShow}>
			<Dialog.Trigger className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
				<Plus className="size-4" /> Додати
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40" />
				<Dialog.Content
					onCloseAutoFocus={(e) => e.preventDefault()}
					className="fixed left-1/2 top-1/2 w-11/12 max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg bg-white"
				>
					<Dialog.Title className="text-xl font-semibold">
						Додавання фото
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Завантаж фотографії та обери товар.
					</Dialog.Description>

					<div className="mt-5 space-y-4">
						<div className="flex items-center">
							<span className="grow text-ellipsis">
								{selectedProduct?.name}
							</span>
							<button
								onClick={() => setIsOpenCMDK(true)}
								className="shrink-0 border px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-50"
							>
								Обрати товар
							</button>
						</div>
						<CMDK
							isOpen={isOpenCMDK}
							onChangeOpen={setIsOpenCMDK}
							search={searchValue}
							onChangeSearch={setSearchValue}
							closeOnSelect={true}
							items={products
								?.filter((el) =>
									`${el.name.toLowerCase()} ${el.searchCode} ${el.code.toLowerCase()}`.includes(
										debouncedSearchValue.toLowerCase(),
									),
								)
								.slice(0, 50)
								.map((p) => ({
									id: p.ref,
									name: `${p.searchCode} ${p.name}`,
									onClick: () => setSelectedProduct(p),
								}))}
						/>
						<div className="space-y-2">
							<div className="flex justify-between">
								<label className="text-sm font-medium">Фотографії</label>
								<label className="text-sm">
									Статус
									<select
										className="bg-transparent cursor-pointer hover:bg-gray-100 rounded-lg px-1"
										value={defaultPhotoStatus}
										onChange={(e) =>
											setDefaultPhotoStatus(e.target.value as any)
										}
									>
										{photoStatuses.map((status) => (
											<option value={status}>{status}</option>
										))}
									</select>
								</label>
							</div>
							<div
								onClick={() => fileInputRef.current?.click()}
								onDrop={handleDrop}
								onDragOver={(e) => {
									e.preventDefault();
									setIsDragging(true);
								}}
								onDragLeave={(e) => {
									e.preventDefault();
									setIsDragging(false);
								}}
								className={`group flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors ${
									isDragging
										? "border-primary bg-gray-200"
										: "border-muted-foreground/25 hover:border-primary/50"
								}`}
							>
								<Upload className="size-6 text-muted-foreground group-hover:-translate-y-1 duration-300" />
								<p className="text-sm text-muted-foreground">
									Перетягни фото або натисни для вибору
								</p>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									multiple
									onChange={(e) => handleFileSelect(e.target.files)}
									className="hidden"
								/>
							</div>
						</div>
						<div
							className={`grid grid-cols-4 gap-2 duration-100 ${!photos.length ? "h-0" : "h-28"}`}
						>
							{photos.map((photo) => (
								<div
									key={photo.id}
									className="group relative aspect-square overflow-hidden rounded-md border"
								>
									<img
										src={photo.preview}
										alt=""
										className="size-full object-cover"
									/>
									<button
										type="button"
										onClick={() => removePhoto(photo.id)}
										className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 bg-red-200"
									>
										<X className="size-3" />
									</button>
								</div>
							))}
						</div>
					</div>
					<div className="mt-6 flex justify-end gap-2">
						<Dialog.Close className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent">
							Скасувати
						</Dialog.Close>
						<button
							onClick={handleSubmit}
							disabled={!selectedProduct || photos.length === 0 || isSending}
							className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 bg-violet-100 hover:bg-violet-50 disabled:bg-transparent"
						>
							{isSending ? (
								<>wait...</>
							) : (
								<>Завантажити {photos.length > 0 && `(${photos.length})`}</>
							)}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

type PhotoDialogProps = {
	show: boolean;
	onClose: () => void;
	photo: Photo | null;
};

function PhotoDialog({ show, onClose, photo }: PhotoDialogProps) {
	const { pb_base_url } = useConfig();
	const [photoStatus, setPhotoStatus] = useState<PhotoStatus | null>(null);

	useEffect(() => {
		if (photo?.status) {
			setPhotoStatus(photo.status);
		}
	}, [photo?.status]);

	if (!photo) {
		return null;
	}

	async function updatePhotoStatus() {
		await fetch(
			`${pb_base_url}/api/collections/photo_product_link/records/${photo?.id}`,
			{
				method: "PATCH",
				body: JSON.stringify({
					status: photoStatus,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			},
		).then((r) => {
			if (!r.ok) {
				alert(":(");
			}
		});
	}

	async function downloadPhoto(url: string, filename: string) {
		const response = await fetch(url);
		const blob = await response.blob();

		const blobUrl = window.URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = blobUrl;
		link.download = filename;
		link.click();

		window.URL.revokeObjectURL(blobUrl);
	}

	return (
		<Dialog.Root open={show} onOpenChange={onClose}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-20" />
				<Dialog.Content className="fixed left-1/2 top-1/2 max-w-lg h-5/6 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background p-3 shadow-lg bg-white flex flex-col gap-4 z-20">
					<Dialog.Title className="sr-only">Фото</Dialog.Title>
					<img
						className="h-full rounded-lg object-cover"
						src={`${pb_base_url}/api/files/photo_product_link/${photo.id}/${photo.file}`}
					/>
					<div className="flex justify-between">
						<div className="flex gap-2">
							<select
								value={photoStatus as string}
								onChange={(e) => setPhotoStatus(e.target.value as any)}
								className="px-2 py-0.5 bg-white border rounded-lg cursor-pointer"
							>
								{photoStatuses.map((status) => (
									<option value={status}>{status}</option>
								))}
							</select>
							<button
								className="border p-3 rounded-lg hover:shadow-lg disabled:hover:shadow-none duration-75 disabled:opacity-35"
								disabled={photo.status === photoStatus}
								onClick={updatePhotoStatus}
							>
								<Save className="size-4" />
							</button>
							<button
								onClick={() =>
									downloadPhoto(
										`${pb_base_url}/api/files/photo_product_link/${photo.id}/${photo.file}`,
										photo.file,
									)
								}
								className="border p-3 rounded-lg hover:shadow-lg disabled:hover:shadow-none duration-75 disabled:opacity-35"
							>
								<Download className="size-4" />
							</button>
						</div>

						<button
							className="border p-3 rounded-lg hover:shadow-lg disabled:hover:shadow-none duration-75 disabled:opacity-35"
							disabled={photo.status !== "ready"}
						>
							<SendHorizonal className="size-4" />
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
