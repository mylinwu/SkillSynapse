import { Github, Settings as SettingsIcon } from "lucide-react";
import type React from "react";

interface HeaderProps {
	toggleSidebar: () => void;
	onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, onOpenSettings }) => {
	return (
		<header className="bg-white/90 backdrop-blur-md sticky top-0 z-10 h-14 flex items-center justify-between px-4">
			<div className="flex items-center gap-4">
				<button
					className="lg:hidden p-2 text-stone-500 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors"
					onClick={toggleSidebar}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
				<div className="font-semibold text-stone-800 lg:hidden">
					SkillSynapse
				</div>
			</div>

			<div className="flex items-center gap-2">
				{/* GitHub Link */}
				<a
					href="https://github.com/mylinwu/SkillSynapse"
					target="_blank"
					rel="noopener noreferrer"
					className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors shrink-0"
					title="GitHub 仓库"
				>
					<Github className="h-5 w-5" />
				</a>
				
				{/* Settings Toggle Button */}
				<button
					onClick={onOpenSettings}
					className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors shrink-0"
					title="设置"
				>
					<SettingsIcon className="h-5 w-5" />
				</button>
			</div>
		</header>
	);
};

export default Header;
