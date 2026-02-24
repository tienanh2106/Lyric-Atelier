import { ALL_ROUTER } from '@/routes';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel animate-in fade-in slide-in-from-bottom-12 flex flex-col items-center gap-8 rounded-[3rem] border border-slate-200 p-12 text-center duration-700">
        <div className="flex items-center gap-3">
          <span className="text-6xl font-black text-slate-900">404</span>
          <div className="h-2 w-2 rounded-full bg-amber-500"></div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-black uppercase tracking-widest text-slate-900">
            Không Tìm Thấy Trang
          </h1>
          <p className="text-[11px] uppercase tracking-widest text-slate-600">
            Trang bạn đang tìm kiếm không tồn tại
          </p>
        </div>
        <Link
          to={ALL_ROUTER.PUBLIC.HOME}
          className="rounded-full border border-amber-500 bg-amber-500 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-[0.98]"
        >
          Về Trang Chủ
        </Link>
      </div>
    </div>
  );
};
