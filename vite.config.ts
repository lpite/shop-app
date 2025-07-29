import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
import react from "@vitejs/plugin-react";
import { execSync } from 'node:child_process'
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
	],
	define: {
		"process.env.NODE_ENV": '"production"',
		__BUILD_ID__: JSON.stringify(execSync('git rev-parse --short HEAD').toString().trim()),
	},
});
