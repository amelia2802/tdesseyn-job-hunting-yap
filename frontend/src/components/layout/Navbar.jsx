export default function Navbar(){
    return(
        <header className="w-full flex items-center justify-between p-8">
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
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Tips and Tricks</a></li>
                    <li><a href="#">About</a></li>
                </ul>
            </nav>
        </header>
    )
}