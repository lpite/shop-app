import { ReactNode } from "react";

type ShowProps = {
	children: ReactNode;
	when: boolean;
};

export default function Show({ children, when }: ShowProps) {
	if (when) {
		return children;
	}
	return null;
}
