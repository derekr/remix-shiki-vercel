import * as shiki from "shiki";
import { useLoaderData } from "@remix-run/react";

export const loader = async () => {
  const code = 'const foo = "bar"';
  const highlighter = await shiki.getHighlighter({
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
