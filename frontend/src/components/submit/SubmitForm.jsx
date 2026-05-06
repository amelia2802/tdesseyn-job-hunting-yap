export default function SubmitForm() {
    return(
        <form className="w-full flex items-center justify-center gap-5">
            <input className="w-1/2 px-3 py-2 border border-neutral-80 rounded-md" type="text" placeholder="Paste the Spotify Link to generate..." />
            <button className="w-max px-3 py-2 rounded-md text-neutral-50 bg-gradient-to-r from-brand-primary to-sea" type="submit">Generate</button>
        </form>
    )
}