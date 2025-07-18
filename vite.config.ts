import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), splitVendorChunkPlugin()],
	define: {
		"process.env.NODE_ENV": '"production"',
		__BUILD_ID__: JSON.stringify(new Date().toLocaleString()),
	},
});
