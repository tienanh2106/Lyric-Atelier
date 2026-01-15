export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 bg-white/90 p-6 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            System Active
          </span>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          © ATELIER PLATINUM 2025
        </span>
      </div>
    </footer>
  );
};
