import React from "react"

type ShowProps = {
	children: React.ReactNode,
	when: boolean
}

export default function Show({
	children,
	when
}: ShowProps) {
	if(when){
		return children
	}
	return null
}