import { HOME_FEATURES } from "./home-features-data";

// Grid 3 cot x 2 hang (dung khop 6 the), the nghieng 3D nhe (rotateX/rotateY
// + translateZ) khi hover, kem 1 lop "do sau" (bong mo phia sau) noi len -
// dung [perspective] tren container + [transform-style:preserve-3d] long
// nhau (grid > the > icon/tieu de) de icon va tieu de "noi" len 1 lop rieng,
// tao cam giac 3D that thay vi chi phang.
export function HomeFeatureGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 [perspective:1200px] sm:grid-cols-2 lg:grid-cols-3">
      {HOME_FEATURES.map(({ title, icon: Icon, iconBg }, index) => (
        <div
          key={title}
          className="group relative h-64 rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out [transform-style:preserve-3d] hover:-translate-y-3 hover:[transform:rotateX(6deg)_rotateY(-6deg)_translateZ(20px)] hover:shadow-[0_35px_70px_rgba(0,0,0,0.15)]"
        >
          {/* Lop "do sau" - bong mo phia sau, chi hien va lech ra khi hover */}
          <div
            className="absolute inset-0 -z-10 rounded-3xl bg-black/[0.03] opacity-0 transition-all duration-500 group-hover:translate-x-3 group-hover:translate-y-4 group-hover:opacity-100"
            style={{ transform: "translateZ(-30px)" }}
          />

          <div className="relative h-full [transform-style:preserve-3d]">
            <div
              className={`absolute top-0 left-0 grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-500 group-hover:[transform:translateZ(35px)] ${iconBg}`}
            >
              <Icon size={22} className="text-white" strokeWidth={2} />
            </div>

            <div className="absolute bottom-0 left-0">
              <p className="text-sm text-neutral-400">
                0{index + 1}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[#182338] transition-transform duration-500 group-hover:[transform:translateZ(45px)]">
                {title}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
