import { useEffect, useState, type ReactNode } from "react";

function renderMarkdownish(raw: string): ReactNode[] {
  const lines = raw.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.startsWith("# ")) {
      blocks.push(
        <h1
          key={`h1-${i}`}
          className="text-2xl font-bold text-gray-900 mt-8 first:mt-0 mb-3"
        >
          {line.slice(2)}
        </h1>
      );
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={`h2-${i}`} className="text-lg font-semibold text-swaroop-800 mt-6 mb-2">
          {line.slice(3)}
        </h2>
      );
      i += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith("- ")) {
        items.push((lines[i] ?? "").slice(2));
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
          {items.map((text, j) => (
            <li key={j}>{text}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.trim() === "---") {
      blocks.push(<hr key={`hr-${i}`} className="my-8 border-swaroop-100" />);
      i += 1;
      continue;
    }

    if (line.trim() === "") {
      blocks.push(<div key={`sp-${i}`} className="h-2" />);
      i += 1;
      continue;
    }

    if (line.startsWith("_") && line.endsWith("_") && line.length > 2) {
      blocks.push(
        <p key={`em-${i}`} className="text-sm text-gray-500 italic">
          {line.slice(1, -1)}
        </p>
      );
      i += 1;
      continue;
    }

    blocks.push(
      <p key={`p-${i}`} className="text-gray-700 leading-relaxed">
        {line}
      </p>
    );
    i += 1;
  }

  return blocks;
}

export default function ContactEmailPage() {
  const [body, setBody] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/resources/_emailID.md", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Could not load email list (${res.status})`);
        }
        const text = await res.text();
        if (!cancelled) {
          setBody(text);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-swaroop-50/80 to-white">
      <main className="max-w-3xl mx-auto px-4 py-14">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-swaroop-600 mb-2">
            Contact
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Email addresses</h1>
          <p className="mt-3 text-gray-600">
            Sourced from{" "}
            <code className="text-xs bg-swaroop-50 px-1 rounded">_0_Resources/_emailID.md</code>{" "}
            (mirrored under{" "}
            <code className="text-xs bg-swaroop-50 px-1 rounded">public/resources</code>).
          </p>
        </header>

        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 text-red-800 px-4 py-3 text-sm">
            {error}
          </div>
        ) : body == null ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : (
          <article className="max-w-none bg-white rounded-2xl border border-swaroop-100 shadow-sm p-8">
            {renderMarkdownish(body)}
          </article>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-gray-500 border-t border-gray-100 bg-white">
        Zyrowaste · Swaroop Formulation Industries Pvt. Ltd. · Chukkusehri, Hasanganj, Unnao, UP 209841
      </footer>
    </div>
  );
}
