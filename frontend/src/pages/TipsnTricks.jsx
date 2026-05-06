import { SlMagnifier } from "react-icons/sl";
import { CiFilter } from "react-icons/ci";
import { tipsData } from "../data/tipsData";
import TipList from "../components/tips/TipList";

export default function TipsnTricks() {
    return (
        <section className="w-full px-30 flex flex-col justify-center gap-10 relative z-10">
            <div className="flex flex-col ">
                <div>
                    <h2 className="font-extrabold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-liliac leading-20">Tips & Tricks</h2>
                    <p className="text-gray-400">Browse insights from Guidance Counselor 2.0; filter by audience, format or date.</p>
                </div>
                <>
                    <SlMagnifier className="relative left-2 translate-y-8 translate-x-1 text-xl text-gray-400"/>
                    <input className="w-1/2 border border-gray-300 px-9 bg-neutral-50 py-2 rounded" type="text" placeholder="Search Tips..." />
                </>
            </div>
            <div className="flex items-center justify-around text-gray-600">
                <CiFilter />
                <div></div>
                <span>|</span>
                <div></div>
                <span>|</span>
                <div></div>
            </div>
            <div className="w-full">
                <TipList tips={tipsData}>
                </TipList>
            </div>   
        </section>
    )
}