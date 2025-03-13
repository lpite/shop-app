import * as Dialog from "@radix-ui/react-dialog";
import { fetcher } from "../utils/fetcher";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { useEffect, useState } from "react";

type CommentPopupProps = {
	partnerId: string;
	buttonText?: string;
};

export default function CommentPopup({
	partnerId,
	buttonText,
}: CommentPopupProps) {
	const { data: comment } = useSWR(`/comment/${partnerId}`, () =>
		fetcher<string>({
			url: `/shop/hs/app/comment/${partnerId}`,
			method: "GET",
		}),
	);
	const [commentText, setCommentText] = useState("");
	const [isOpen, setIsOpen] = useState(false);

	const { trigger: saveComment } = useSWRMutation("/comment/${partnerId}", () =>
		fetcher<string>({
			url: `/shop/hs/app/comment/${partnerId}`,
			method: "POST",
			body: {
				partnerId,
				commentText,
			},
		}),
	);

	useEffect(() => {
		setCommentText(comment || "");
	}, [comment]);

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger asChild>
				{buttonText ? (
					<button className="h-10 px-4 bg-sky-300 rounded-lg">
						{" "}
						{buttonText}
					</button>
				) : (
					<button className="text-sky-600 mx-2 rounded-lg font-bold tracking-wider">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="22"
							height="22"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
							<path
								fillRule="evenodd"
								d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
							/>
						</svg>
					</button>
				)}
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
				<Dialog.Content className="fixed min-w-3/6 min-h-80 w-96 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg">
					<Dialog.Title className="text-2xl pb-3 font-medium">
						Коментар
					</Dialog.Title>
					<textarea
						value={commentText}
						onChange={(e) => setCommentText(e.target.value)}
						className="border-2 rounded-lg shadow-sm outline-none p-2 resize-none w-full h-48"
					></textarea>
					<div className="mt-4 flex gap-3 justify-end">
						<button
							onClick={() => {
								saveComment();
								mutate("/stats/");
								setIsOpen(false);
								setCommentText("");
							}}
							disabled={
								commentText === "Нет документа за сегодня с таким партнером"
							}
							className="bg-green-300 hover:bg-green-200 px-4 py-2 rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
						>
							Зберегти
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
