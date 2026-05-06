export default function TipList({tips}){
    return(
        <div className="grid grid-cols-3 gap-4">
            { tips.map((tip)=>
                <div key={tip.id} className="flex flex-col gap-5 border border-sea bg-[#c8b9ff72] px-4 py-3 backdrop-blur-xs rounded-sm">
                    <div className="flex justify-between">
                        <p className="bg-brand-primary px-3 rounded-full text-brand-secondary-light">{tip.type}</p>
                        <p className="bg-sea px-3 rounded-full text-brand-secondary-light">{tip.category}</p>
                    </div>
                    <h3 className="text-center text-xl font-bold">{tip.title}</h3>
                    <p>{tip.text}</p>
                    <p className="text-slate-400 italic">{tip.date}</p>
                </div>
            )}
        </div>
    )
}