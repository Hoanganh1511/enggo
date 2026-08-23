"use client";

// Hero dau trang /home - thay cho khoi tieu de nho "Everything you need" cu.
// Nen luoi caro gio dat chung o (main)/layout.tsx cho TOAN BO trang (khong
// con ve rieng o day nua) - component nay chi con phan noi dung (badge/tieu
// de/mo ta/2 nut).
export function HomeHero() {
  return (
    <div className="relative overflow-hidden">
      <div className="relative flex w-full flex-col gap-y-[20px] items-center px-6 pt-20 pb-16 sm:pt-40 sm:pb-30 text-center ">
        <div className="group  bg-[#f5f5f5]/40 border border-gray-200/80 px-5 py-1 text-[14.5px] font-medium rounded-full flex max-w-full min-w-0 items-center gap-2 p-1 transition-colors duration-200">
          Your life deserves a system
        </div>
        <h1 className="max-w-3xl text-[32px] leading-tight font-extrabold text-ink sm:text-[48px] ">
          Quản lý{" "}
          <span className="relative inline-block">
            <span
              className="relative z-10  pr-2 inline-block
      font-black
      italic
      tracking-[-0.065em]"
            >
              cả cuộc đời
            </span>

            <span
              className="
        absolute
        bottom-0 left-0
        h-[8px] w-full
        -rotate-[1deg]
        rounded-sm
        bg-neutral-200
      "
            />
          </span>{" "}
          cho bạn
        </h1>
        <p className=" max-w-xl text-[15px] text-ink-muted sm:text-[17px]">
          Tôi luôn cập nhật và phục vụ cho bạn những mô hình quản lý cuộc sống
          mới nhất
        </p>

        <div className=" flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("home-feature-grid")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="cursor-pointer rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-85"
          >
            Khám phá ngay
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-[#e4e4e7] bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            Buy Alls
          </button>
        </div>
      </div>
    </div>
  );
}
