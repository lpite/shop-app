import * as Dialog from "@radix-ui/react-dialog";


export function CarSelectorDialog(){
	return (
		<Dialog.Root >
			<Dialog.Trigger>
				meow
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
				<Dialog.Content className="fixed min-w-3/6 min-h-80 w-96 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg">
					<Dialog.Title className="text-2xl pb-3 font-medium">
						dialog
					</Dialog.Title>
				
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>)
}