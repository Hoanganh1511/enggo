import ProductPreviewCard from "./ProductPreviewCard";

const ProductPreviewSection = () => {
  return (
    <section id="product-preview" className="mx-auto max-w-5xl px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Cả hành trình học tập,{" "}
          <span className="bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            trong 1 màn hình
          </span>
        </h2>
        <p className="mt-4 text-slate-400">
          Mỗi node là 1 chủ đề, mỗi đường nối là 1 mối liên hệ — nhìn thấy
          ngay bạn đang mạnh ở đâu và đang bỏ quên chỗ nào.
        </p>
      </div>

      <div className="relative mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="absolute top-5 left-6 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-violet-400/70" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
        </div>

        <div className="mt-8 flex flex-col items-start gap-0">
          <ProductPreviewCard
            title="Sự nghiệp của tôi"
            meta="12 ghi chú · 3 nhánh"
            score={94}
            mastery={40}
            branches={3}
            notes={8}
            streak={8}
            insight="Tiếp tục ghi chú đều đặn để lấp đầy các khoảng trống kiến thức."
            accent="blue"
          />

          <div className="ml-8 h-10 w-px bg-linear-to-b from-blue-400/60 to-emerald-400/60" />

          <div className="ml-8">
            <ProductPreviewCard
              title="Backend"
              meta="9 ghi chú · 3 nhánh"
              score={100}
              mastery={45}
              branches={3}
              notes={9}
              streak={12}
              insight="Bạn đã sẵn sàng để nâng cấp kiến thức — thử sang &quot;RabbitMQ&quot;."
              accent="emerald"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPreviewSection;
