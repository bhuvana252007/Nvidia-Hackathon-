import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // First replace block equations: $$...$$
    let text = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, equation) => {
      try {
        return `<div class="my-3 overflow-x-auto py-1 text-center">${katex.renderToString(equation.trim(), {
          displayMode: true,
          throwOnError: false
        })}</div>`;
      } catch (err) {
        return `<pre class="text-xs text-yellow-400 font-mono">$$${equation}$$</pre>`;
      }
    });

    // Then replace inline equations: $...$ (avoiding currency like $10 or $840)
    text = text.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (_, prefix, equation) => {
      // If it looks purely like currency ($10, $840), don't treat as math
      if (/^\s*\d+(\.\d+)?\s*$/.test(equation)) {
        return `${prefix}$${equation}`;
      }
      try {
        const mathHtml = katex.renderToString(equation.trim(), {
          displayMode: false,
          throwOnError: false
        });
        return `${prefix}<span class="inline-math px-0.5">${mathHtml}</span>`;
      } catch {
        return `${prefix}$${equation}$`;
      }
    });

    return text;
  }, [content]);

  return (
    <span
      className={`math-rendered-block ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
