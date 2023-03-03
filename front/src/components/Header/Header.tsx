import { A, useNavigate } from "@solidjs/router"
import styles from "./Header.module.scss"

import { AppBar, Avatar, Box, Button, Container, Toolbar } from "@suid/material"
import MenuIcon from "@suid/icons-material/Menu"
import AdbIcon from "@suid/icons-material/Adb"
import { For } from "solid-js"

const pages = [
	{name:"Головна",href:"/"},
	{name:"Надходження",href:"/income"},
	{name:"Продаж",href:"/sale"},
	{name:"Номенклатура",href:"/nomenclature"}
	];
export default function Header() {
	const navigate = useNavigate()
	return (
			<AppBar position="static">
				<Container maxWidth="xl">
					<Toolbar disableGutters>
						<Box sx={{ display: "flex", flexGrow: 1 }}>
							<For each={pages}>
								{(page) => (
									<Button
										onClick={()=>navigate(page.href)}
										sx={{ my: 2, color: 'white', display: 'block' }}
									>
										{page.name}
									</Button>
								)}
							</For>
						</Box>
					</Toolbar>
				</Container>
			</AppBar>
	)
}