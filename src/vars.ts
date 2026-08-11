import FalconFrame from "@wxn0brp/falcon-frame";

export const red = "\x1b[31m";
export const clear = "\x1b[0m";
export const green = "\x1b[32m";
export const cyan = "\x1b[36m";

export const baseStyle = `<style>
    :root{
        --bg: #111;
        --bg-elev: #17181c;
        --fg: #e6e6e6;
        --muted: #9aa1ab;
        --accent: #5aa8ff;
        --accent-hover: #7bb8ff;
        --border: #2a2d33;
    }
    body{
        margin: 0;
        min-height: 100vh;
        background-color: var(--bg);
        color: var(--fg);
        font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
        line-height: 1.7;
    }
    main{
        max-width: 720px;
        margin: 0 auto;
        padding: 1rem 1.25rem 0;
    }
    a{
        color: var(--accent);
        text-decoration: none;
    }
    a:hover{
        color: var(--accent-hover);
        text-decoration: underline;
    }
</style>`;

export const notFoundArray = [
	"404.html",
	"not-found.html",
	"not_found.html",
];

export const iconPath = process.env.SERVER_FAVICON;

export const app = new FalconFrame();
