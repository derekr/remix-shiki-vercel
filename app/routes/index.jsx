import * as shiki from "shiki";
import { useLoaderData } from "@remix-run/react";
import path from "path";
import fs from "fs";

// Shiki loads languages and themes using "fs" instead of "import", so Next.js
// doesn't bundle them into production build. To work around, we manually copy
// them over to our source code (lib/shiki/*) and update the "paths".
//
// Note that they are only referenced on server side
// See: https://github.com/shikijs/shiki/issues/138
const getShikiPath = () => {
  return path.join(process.cwd(), "app/shiki");
};

const touched = { current: false };

// "Touch" the shiki assets so that Vercel will include them in the production
// bundle. This is required because shiki itself dynamically access these files,
// so Vercel doesn't know about them by default
const touchShikiPath = () => {
  if (touched.current) return; // only need to do once
  fs.readdir(getShikiPath(), () => null); // fire and forget
  touched.current = true;
};

const getHighlighter = async (options) => {
  touchShikiPath();

  const highlighter = await shiki.getHighlighter({
    // This is technically not compatible with shiki's interface but
    // necessary for rehype-pretty-code to work
    // - https://rehype-pretty-code.netlify.app/ (see Custom Highlighter)
    ...options,
    paths: {
      languages: `${getShikiPath()}/languages/`,
      themes: `${getShikiPath()}/themes/`,
    },
  });

  return highlighter;
};

export const loader = async () => {
  const code = 'const foo = "bar"';
  const highlighter = await getHighlighter({
    theme: "nord",
  });

  return {
    highlightedCode: await highlighter.codeToHtml(code, "javascript"),
  };
};

export default function Index() {
  const { highlightedCode } = useLoaderData();
  return <div dangerouslySetInnerHTML={{ __html: highlightedCode }}></div>;
}
