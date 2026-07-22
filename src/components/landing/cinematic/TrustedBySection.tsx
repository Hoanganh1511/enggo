import { trustedBy } from "@/content/landing";

// Wordmark minh hoa (khong dung logo thuong hieu that de tranh van de ban
// quyen tren 1 trang demo) - thay bang ten cong ty that + asset SVG that khi
// trien khai production.
const TrustedBySection = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <p className="text-center text-xs font-medium tracking-widest text-slate-500 uppercase">
        Được tin dùng bởi hàng ngàn lập trình viên
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70 grayscale">
        {trustedBy.map((name) => (
          <span
            key={name}
            className="text-lg font-semibold tracking-tight text-slate-400"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
};

export default TrustedBySection;
