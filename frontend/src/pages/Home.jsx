import { useEffect, useState } from "react";
import { PiStarFourLight }  from "react-icons/pi";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { parallaxConfig } from "../components/animations/parallaxConfig";
export default function Home() {
    const [init,setInit] = useState(false);

    useEffect(()=>{
        initParticlesEngine( async (engine)=>{
            await loadSlim(engine);
        }).then(()=>setInit(true));
    }, []);

    
    return (
        <div className="relative w-full min-h-screen">
            {init && (
                <Particles
                    id="tsparticles"
                    options={parallaxConfig}
                    className="absolute inset-0 z-0" 
                />
            )}
            <main className="w-full z-10 p-30 text-xl text-gray-500 flex flex-col items-center justify-center gap-10">
                <p 
                    className="text-xs bg-neutral-50 italic border py-2 px-4
                    border-gray-300 rounded-full flex items-center gap-2"
                >
                    <PiStarFourLight /> 
                    Powered by Gemini 1.5 Flash
                </p>
                <h2 
                    className="font-extrabold text-5xl text-transparent bg-clip-text
                    bg-gradient-to-r from-brand-primary to-sea"
                >
                    Guidance Councellor 2.0
                    <span className="text-brand-secondary-dark"> Notes</span>
                </h2>
                <p>Extract actionable tips, tricks, and strategies from Taylor Desseyn's Guidance Counselor 2.0 podcast -- instantly.</p>
            </main>
        </div>
    )
}