import { PiStarFourLight,PiLinkLight }  from "react-icons/pi";
import { IoIosArrowRoundForward } from "react-icons/io";
export default function Home() {
    return (
        <main className="w-full p-30 text-xl text-gray-500 flex flex-col items-center justify-center gap-10">
            <p 
                className="text-xs bg-neutral-50 italic border py-2 px-4
                 border-gray-300 rounded-full flex items-center gap-2"
            >
                <PiStarFourLight /> 
                Powered by Gemini 1.5 Flash
            </p>
            <h2 
                className="font-extrabold text-5xl text-transparent bg-clip-text
                 bg-gradient-to-r from-brand-primary to-lavendar"
            >
                Guidance Councellor 2.0
                <span className="text-brand-secondary-dark"> Notes</span>
            </h2>
            <p>Extract actionable tips, tricks, and strategies from Taylor Desseyn's Guidance Counselor 2.0 podcast -- instantly.</p>
            <div className="w-full justify-center flex gap-4">
                <PiLinkLight className="relative left-10 translate-y-3 translate-x-1 text-2xl text-gray-400" />
                <input 
                    className="w-1/2 border border-gray-300 px-9 py-2 rounded" 
                    type="text" 
                    placeholder="Paste X/LinkedIn live link here..." 
                />
                <button 
                    className="w-auto p-2 bg-lavendar text-neutral-50 rounded 
                    flex items-center justify-center gap-2"
                >
                    Generate 
                    <IoIosArrowRoundForward />
                </button>
            </div>
            <figcaption className="text-sm">Paste a link from Taylor's live sessions to extract key insights</figcaption>
        </main>
    )
}