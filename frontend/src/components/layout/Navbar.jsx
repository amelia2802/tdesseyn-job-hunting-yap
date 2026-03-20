import { NavLink } from 'react-router-dom';
export default function Navbar() {
    return (
        <header className="w-full sticky top-0 z-50 backdrop-blur-xs flex items-center justify-between p-8 border-b border-gray-300">
            <div className="flex items-center gap-2">
                <h1
                    className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary 
                to-lavendar text-xl font-bold"
                >GC 2.0
                </h1>
                <p className="text-sm text-mauve font-semibold">Tips from &#64;tdesseyn</p>
            </div>
            <nav>
                <ul className="flex gap-6 text-mauve font-semibold">
                    <li><NavLink to="/" className={({ isActive }) => isActive ? "text-brand-primary transition-colors" : "hover:text-brand-primary transition-colors"}>Home</NavLink></li>
                    <li><NavLink to="/tips" className={({ isActive }) => isActive ? "text-brand-primary transition-colors" : "hover:text-brand-primary transition-colors"}>Tips and Tricks</NavLink></li>
                    <li><NavLink to="/about" className={({ isActive }) => isActive ? "text-brand-primary transition-colors" : "hover:text-brand-primary transition-colors"}>About</NavLink></li>
                </ul>
            </nav>
        </header>
    )
}