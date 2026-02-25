export const FeaturesSection = () => {
  const features = [
    {
      title: 'AI Chuyên Nghiệp',
      description: 'Sử dụng công nghệ AI tiên tiến để tái tạo lời bài hát với chất lượng cao',
      icon: '✨',
    },
    {
      title: 'Đa Ngôn Ngữ',
      description: 'Hỗ trợ viết lại từ nhiều ngôn ngữ sang tiếng Việt với âm vần chuẩn',
      icon: '🌍',
    },
    {
      title: 'Vần Điệu Chính Xác',
      description: 'Đảm bảo vần điệu, thanh điệu phù hợp với phong cách nhạc Việt',
      icon: '🎵',
    },
    {
      title: '4 Phong Cách',
      description: 'Chọn phong cách từ V-Pop Trendy đến Ballad Da diết và Triết lý',
      icon: '🎭',
    },
    {
      title: 'Tùy Chỉnh Linh Hoạt',
      description: 'Điều chỉnh chế độ Đồng điệu hoặc Sáng tác tự do theo ý muốn',
      icon: '⚙️',
    },
    {
      title: 'Kết Quả Nhanh',
      description: 'Nhận kết quả chỉ trong vài giây với AI tốc độ cao',
      icon: '⚡',
    },
  ];

  return (
    <section className="animate-in fade-in slide-in-from-bottom-12 delay-225 flex flex-col gap-12 py-20 duration-1000">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
          Tính Năng
        </span>
        <h2 className="text-3xl font-black uppercase tracking-wider text-white md:text-4xl">
          Công Cụ Chuyên Nghiệp
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="glass-panel group flex flex-col gap-4 rounded-[2.5rem] border border-white/[0.07] p-8 transition-all hover:border-amber-500/30 hover:bg-white/[0.06]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-2xl ring-1 ring-amber-500/20">
              {feature.icon}
            </div>
            <h3 className="text-base font-black uppercase tracking-widest text-slate-100">
              {feature.title}
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-500">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
