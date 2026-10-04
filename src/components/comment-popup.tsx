import * as Dialog from "@radix-ui/react-dialog";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { useEffect, useState } from "react";
import { Pos } from "../api/pos";
import { SquarePen } from "lucide-react";

type CommentPopupProps = {
	partnerId: string;
	buttonText?: string;
};

export default function CommentPopup({
	partnerId,
	buttonText,
}: CommentPopupProps) {
	const {
		data: comment,
		mutate: mutateComment,
		isLoading: isLoadingComment,
	} = useSWR(`/comment/${partnerId}`, () => Pos.getComment(partnerId));
	const [commentText, setCommentText] = useState("");
	const [isOpen, setIsOpen] = useState(false);

	const { trigger: saveComment } = useSWRMutation("/comment/${partnerId}", () =>
		Pos.updateComment(partnerId, commentText),
	);

	useEffect(() => {
		setCommentText(comment || "");
	}, [comment]);

	useEffect(() => {
		mutateComment();
	}, [isOpen]);

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger asChild>
				{buttonText ? (
					<button className="h-10 px-4 bg-sky-300 rounded-lg">
						{buttonText}
					</button>
				) : (
					<button className="text-sky-600 mx-2 rounded-lg font-bold tracking-wider">
						<SquarePen />
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
						disabled={isLoadingComment}
						onChange={(e) => setCommentText(e.target.value)}
						className="border-2 rounded-lg shadow-sm outline-none p-2 resize-none w-full h-48 disabled:bg-gray-200"
					></textarea>
					<div className="mt-4 flex gap-3 justify-end">
						<button
							onClick={() => {
								saveComment();
								mutate("/stats/");
								mutateComment();
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
