import { Plus, Upload, X } from "lucide-react";
import useSWR from "swr";
import { useConfig } from "../stores/config-store";
import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState } from "react";
import { fetcher } from "../utils/fetcher";
import { CMDK } from "../components/cmdk";
import { useDebounce } from "@uidotdev/usehooks";

export default function PhotoStudio() {
	const { pb_base_url } = useConfig();
	const { data: photos } = useSWR(
		"pb/photo_product_link",
		() =>
			fetch(
				`${pb_base_url}/api/collections/photo_product_link/records?sort=-created`,
			)
				.then((r) => r.json())
				.then((r) => r.items) as Promise<
				{
					product_ref: string;
					photo: string;
					collectionId: string;
					id: string;
				}[]
			>,
	);

	return (
		<main className="p-4">
			<div className="py-2">
				<AddPhotosDialog />
			</div>
			<div className="flex flex-wrap gap-2">
				{photos?.map(({ product_ref, photo, collectionId, id }) => (
					<div className="flex flex-col border w-full md:size-56 p-2">
						<span>{product_ref}</span>
						<img
							className="object-contain h-56 md:h-36"
							src={`${pb_base_url}/api/files/${collectionId}/${id}/${photo}`}
						/>
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

function AddPhotosDialog() {
	const [open, setOpen] = useState(false);

	const [selectedProduct, setSelectedProduct] = useState<{
		ref: string;
		searchCode: string;
		name: string;
	} | null>(null);
	const [photos, setPhotos] = useState<PhotoPreview[]>([]);
	const [isDragging, setIsDragging] = useState(false);
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
		setOpen(false);
	};

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
				<Plus className="size-4" /> Додати
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40" />
				<Dialog.Content className="fixed left-1/2 top-1/2 w-11/12 max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg bg-white">
					<Dialog.Title className="text-xl font-semibold">
						Додавання фото
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Завантажте фотографії та оберіть продукт.
					</Dialog.Description>

					<div className="mt-5 space-y-4">
						<div className="flex">
							<span className="grow text-ellipsis">
								{selectedProduct?.name}
							</span>{" "}
							<button
								onClick={() => setIsOpenCMDK(true)}
								className="shrink-0 border bg-sky-200 px-2 py-1 rounded-lg"
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
							<label className="text-sm font-medium">Фотографії</label>
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
								className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors ${
									isDragging
										? "border-primary bg-primary/5"
										: "border-muted-foreground/25 hover:border-primary/50"
								}`}
							>
								<Upload className="size-6 text-muted-foreground" />
								<p className="text-sm text-muted-foreground">
									Перетягніть або натисніть для вибору
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
						{photos.length > 0 && (
							<div className="grid grid-cols-4 gap-2">
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
						)}
					</div>
					<div className="mt-6 flex justify-end gap-2">
						<Dialog.Close className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent">
							Скасувати
						</Dialog.Close>
						<button
							onClick={handleSubmit}
							disabled={!selectedProduct || photos.length === 0 || isSending}
							className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
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
