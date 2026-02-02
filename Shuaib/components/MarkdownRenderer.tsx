
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-slate max-w-none break-words">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc ml-5 mb-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-5 mb-3">{children}</ol>,
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-slate-900">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-slate-800">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4 text-emerald-700 flex items-center gap-2 border-l-4 border-emerald-500 pl-3">{children}</h3>,
          code: ({ children }) => <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600">{children}</code>,
          strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
