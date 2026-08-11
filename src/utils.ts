export const escapeHtml = (s: string) =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

export function isIconPath(path: string) {
	if (path.endsWith(".ico")) return true;
	return /^(favicon|icon\.|apple-touch-icon)/.test(path.split("/").pop() || "");
}

export function pad(str: string, length: number, char = " ") {
	while (str.length < length) str += char;
	return str;
}
