export default function About(){
    return(
        <section className="relative z-10 p-10">
            <h2 className="font-extrabold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-liliac leading-20">About</h2>
            <p className="text-gray-400">The people and platforms behind the Podcast.</p>
            <section className="mt-5 flex flex-col gap-7 justify-center">
                <div className="flex items-center gap-5">
                    <div className="w-1/2">
                        <h4 className="text-2xl bold">Meet The Host: Taylor Desseyn</h4>
                        <p className="text-xl text-wrap">
                            Taylor Desseyn is a senior technical recruiter, content creator,
                            and community builder who has dedicated his career to helping people
                            navigate the tech job market. 
                        </p>
                    </div>
                    <div className="w-1/2 rounded">
                        <img className="w-full aspect-square object-cover rounded" src="https://pbs.twimg.com/profile_images/2039759284771209216/FUVo04aO_400x400.jpg" alt="twitter profile of @tdesseyn" />
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <div className="w-1/2">
                        <h4 className="text-2xl bold">Guidance Counselor 2.0</h4>
                        <p className="text-xl text-wrap">
                            Guidance Counselor 2.0 is Taylor's flagship podcast and live 
                            show where he interviews industry leaders, hiring managers, 
                            and career experts. Each episode delivers actionable strategies
                            for job seekers at every level looking for their next move.
                            The show covers everything from resume optimization to salary
                            negotiation to building a personal brand.
                        </p>
                    </div>
                    <div className="w-1/2 rounded">
                        <iframe 
                        data-testid="embed-iframe" 
                        className="w-full aspect-square rounded"
                        src="https://open.spotify.com/embed/show/2UBzvscEgepXLUKvA5c24x?utm_source=generator&theme=0" 
                        allowFullScreen 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy"
                        ></iframe>                
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <div className="w-1/2">
                        <h4 className="text-2xl bold">Randstad Digital | Torc</h4>
                        <p className="text-xl text-wrap">
                            Randstad Digital powered by Torc is where 3M technologists 
                            come to find work, sharpen their skills, and build real 
                            relationships with other people who do what they do. A community
                            first, a platform second. that means live events every week, 
                            discord conversations that actually go somewhere, learning 
                            programs built by technologists for technologists, and 
                            an ai-powered matching engine that pairs you with roles based 
                            on your real skills, not your resume keywords.

                        </p>
                    </div>
                    <div className="w-1/2 rounded">
                        <img className="w-full aspect-square object-cover rounded" src="https://pbs.twimg.com/profile_images/1924514819287216128/01j4wGCq_400x400.jpg" alt="twitter profile of @tdesseyn" />
                    </div>
                </div>
            </section>
        </section>
    )
}