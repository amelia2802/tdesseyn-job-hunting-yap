import { SlMagnifier } from "react-icons/sl";
import { CiFilter } from "react-icons/ci";
import TipList from "../components/tips/TipList";
import TipItem from "../components/tips/TipItem";

const tipsData = [
    {
        id: 1,
        type: "Interview",
        category: "Preparation",
        title: "Practice STAR stories",
        text: "Frame answers with Situation, Task, Action, Result for behavioral interviews.",
        date: "2026-03-19",
    },
    {
        id: 2,
        type: "Resume",
        category: "Formatting",
        title: "Quantify your impact",
        text: "Use numbers to show results (e.g., increased traffic 35%).",
        date: "2026-03-18",
    },
    {
        id: 3,
        type: "Networking",
        category: "Strategy",
        title: "Follow up quickly",
        text: "Send a personalized note within 24 hours after meetings.",
        date: "2026-03-17",
    },
];

export default function TipsnTricks() {
    return (
        <section className="w-full px-30 flex flex-col justify-center gap-10">
            <div className="flex flex-col ">
                <div>
                    <h2 className="font-extrabold text-4xl text-brand-secondary-dark leading-20">Tips & Tricks</h2>
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
            <div>
                <TipList>
                    {tipsData.map((tip) => (
                        <TipItem
                            key={tip.id}
                            type={tip.type}
                            category={tip.category}
                            title={tip.title}
                            text={tip.text}
                            date={tip.date}
                        />
                    ))}
                </TipList>
            </div>   
        </section>
    )
}