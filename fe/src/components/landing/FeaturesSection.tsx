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
      title: '12 Phong Cách',
      description: 'Chọn phong cách của 12 nhạc sĩ Việt Nam nổi tiếng',
      icon: '🎭',
    },
    {
      title: 'Tùy Chỉnh Linh Hoạt',
      description: 'Điều chỉnh độ khắt khe về âm vần và cảm xúc bài hát',
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
        <h2 className="text-3xl font-black uppercase tracking-wider text-slate-900 md:text-4xl">
          Công Cụ Chuyên Nghiệp
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="glass-panel flex flex-col gap-4 rounded-[2.5rem] border border-slate-200 p-8 transition-all hover:border-amber-500/40 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-2xl">
              {feature.icon}
            </div>
            <h3 className="text-base font-black uppercase tracking-widest text-slate-900">
              {feature.title}
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
