// Server Component thuan - quote da duoc chon o page.tsx (server, xem
// home-quotes.ts) truyen vao qua props, component nay chi render.
export function HomeQuoteCard({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="font-content relative overflow-hidden rounded-xl bg-[#f6f7f9] px-6 py-7">
      <div aria-hidden="true" className="absolute -right-4 -bottom-4 text-[110px] leading-none text-slate-200/70">
        ⌁
      </div>
      <div aria-hidden="true" className="relative text-3xl text-slate-300">
        &ldquo;
      </div>
      <p className="relative mt-1 max-w-[210px] text-[14px] leading-6 text-slate-600">{quote}</p>
      <p className="relative mt-2 text-[11px] text-slate-400">— {author}</p>
    </div>
  );
}
