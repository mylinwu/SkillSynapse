import type React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownViewProps {
	content: string;
	fontFamily?: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = ({ content, fontFamily }) => {
	return (
		<div
			className="ss-markdown-root font-serif leading-relaxed text-stone-800 dark:text-[#e7e5e4] max-w-none"
			style={fontFamily ? { fontFamily } : undefined}
		>
			<ReactMarkdown
				components={{
					h1: ({ ...props }) => (
						<h1
							className="ss-md-h1 text-3xl font-medium tracking-tight mb-8 pb-4 border-b border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 mt-4"
							{...props}
						/>
					),
					h2: ({ ...props }) => (
						<h2
							className="ss-md-h2 text-xl font-medium mt-10 mb-4 text-stone-800 dark:text-stone-200"
							{...props}
						/>
					),
					h3: ({ ...props }) => (
						<h3
							className="ss-md-h3 text-lg font-medium mt-6 mb-3 text-stone-700 dark:text-stone-300"
							{...props}
						/>
					),
					p: ({ ...props }) => (
						<p
							className="ss-md-p mb-6 text-[1.05rem] text-stone-700 dark:text-stone-300 leading-8"
							{...props}
						/>
					),
					ul: ({ ...props }) => (
						<ul
							className="ss-md-ul list-disc pl-5 space-y-2 mb-6 text-stone-700 dark:text-stone-300"
							{...props}
						/>
					),
					ol: ({ ...props }) => (
						<ol
							className="ss-md-ol list-decimal pl-5 space-y-2 mb-6 text-stone-700 dark:text-stone-300"
							{...props}
						/>
					),
					li: ({ ...props }) => <li className="ss-md-li pl-1 leading-7" {...props} />,
					blockquote: ({ ...props }) => (
						<blockquote
							className="ss-md-blockquote border-l-4 border-stone-300 dark:border-stone-700 pl-4 italic my-6 text-stone-500 dark:text-stone-400"
							{...props}
						/>
					),
					a: ({ ...props }) => (
						<a
							className="ss-md-a text-stone-500 dark:text-[#a8a29e] underline underline-offset-4 decoration-stone-300 dark:decoration-stone-600 hover:text-stone-900 dark:hover:text-white hover:decoration-stone-900 dark:hover:decoration-white transition-colors"
							{...props}
						/>
					),
					// Block Code Container (<pre>)
					pre: ({ children, ...props }) => {
						return (
							// Light mode: bg-stone-100 (light grey)
							// Dark mode: bg-[#1e1e20] (clean dark grey, no stripes/highlight)
							<div className="ss-md-pre-wrap my-6 rounded-xl overflow-hidden bg-stone-100 dark:bg-[#1e1e20] border border-stone-200 dark:border-stone-800/50">
								{/* 
                    whitespace-pre-wrap: Preserves sequences of whitespace (including newlines) 
                    but allows wrapping when necessary. 
                 */}
								<pre
									className="ss-md-pre p-4 overflow-x-auto text-[13px] md:text-sm font-mono leading-relaxed text-stone-800 dark:text-stone-300 whitespace-pre-wrap break-words"
									{...props}
								>
									{children}
								</pre>
							</div>
						);
					},
					// Code Component
					// Utilizes the 'inline' prop passed by react-markdown to distinguish between
					// inline code (`code`) and block code (```code```).
					code: ({
						children,
						...props
					}: React.ComponentPropsWithoutRef<"code">) => {
						const isInline = !props.className?.includes("language-");
						if (isInline) {
							return (
								<code
									className="ss-md-code-inline font-mono text-[0.92em] bg-stone-200/60 dark:bg-stone-700/50 text-[#d85050] dark:text-[#f87171] px-1 py-0.5 rounded mx-0.5"
									{...props}
								>
									{children}
								</code>
							);
						}

						// Block code: No background (handled by pre), inherit text color, standard font
						return (
							<code
								className="ss-md-code-block bg-transparent text-inherit font-mono p-0 border-none"
								{...props}
							>
								{children}
							</code>
						);
					},
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
};

export default MarkdownView;
