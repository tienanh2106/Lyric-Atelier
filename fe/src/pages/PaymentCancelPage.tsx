import { useNavigate } from 'react-router-dom';

export const PaymentCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 px-4">
      <div className="flex flex-col items-center gap-4 rounded-[2.5rem] border border-slate-200 bg-white p-12 shadow-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg
            className="h-8 w-8 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
          Đã Hủy Thanh Toán
        </h1>
        <p className="text-center text-sm text-slate-600">
          Bạn đã hủy quá trình thanh toán. Không có khoản phí nào được tính.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-full border border-slate-300 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:border-amber-500 hover:text-amber-500"
          >
            Về Trang Chủ
          </button>
          <button
            onClick={() => navigate('/#packages')}
            className="rounded-full bg-amber-500 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:bg-amber-600"
          >
            Xem Lại Gói
          </button>
        </div>
      </div>
    </div>
  );
};
