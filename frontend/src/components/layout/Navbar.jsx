import { Link } from 'react-router-dom';
export default function Navbar(){
    return(
        <header className="w-full flex items-center justify-between p-8 border-b border-gray-300">
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
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/tips">Tips and Tricks</Link></li>
                    <li><Link to="/about">About</Link></li>
                </ul>
            </nav>
        </header>
    )
}