import ReactMarkdown from "react-markdown";

type MarkdownProps = {
  content: string;
};

export function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      components={{
        // Customize heading styles
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-foreground">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground">
            {children}
          </h3>
        ),
        // Customize paragraph styles
        p: ({ children }) => (
          <p className="mb-4 text-foreground leading-7">{children}</p>
        ),
        // Customize list styles
        ul: ({ children }) => (
          <ul className="mb-4 ml-6 list-disc text-foreground">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 ml-6 list-decimal text-foreground">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="mb-1 text-foreground">{children}</li>
        ),
        // Customize code styles
        code: ({ children, className }) => {
          const isInline = !className;
          return isInline ? (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
              {children}
            </code>
          ) : (
            <code className={className}>{children}</code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 text-sm">
            {children}
          </pre>
        ),
        // Customize blockquote styles
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-4 text-muted-foreground">
            {children}
          </blockquote>
        ),
        // Customize link styles
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-primary hover:underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        // Customize table styles
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border-collapse border border-border">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-border px-4 py-2">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
