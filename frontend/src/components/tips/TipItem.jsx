export default function TipItem({ type, category, title, text, date }) {
  return (
    <article className="p-4 flex flex-col gap-4 border border-gray-300 rounded shadow-sm">
      <div className="flex items-center gap-4">
        <p className="px-2 rounded-full text-xs text-brand-primary bg-purple-300">{type}</p>
        <p className="px-2 rounded-full text-xs bg-gray-200">{category}</p>
      </div>
      <h3 className="font-bold text-brand-secondary-dark">{title}</h3>
      <p className="text-gray-600">{text}</p>
      <hr className="text-gray-300" />
      <p className="text-right text-sm text-gray-400">{date}</p>
    </article>
  );
}