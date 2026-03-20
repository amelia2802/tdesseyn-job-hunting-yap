import { PiStarFourLight }  from "react-icons/pi";
import SubmitForm from "../components/submit/SubmitForm";
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
            <SubmitForm />
        </main>
    )
}