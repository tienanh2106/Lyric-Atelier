import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { confirmPayment } from '../services/endpoints/payment';

type Status = 'loading' | 'success' | 'error';

export const PaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    const packageId = searchParams.get('packageId');
    const orderCodeStr = searchParams.get('orderCode');

    if (!packageId || !orderCodeStr) {
      setStatus('error');
      return;
    }

    const orderCode = Number(orderCodeStr);
    if (!Number.isInteger(orderCode) || orderCode < 1) {
      setStatus('error');
      return;
    }

    confirmPayment({ packageId, orderCode })
      .then((result) => {
        if (result?.success) {
          setCredits(result.credits);
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        <p className="text-sm text-slate-600">Đang xác nhận thanh toán...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-4 rounded-[2.5rem] border border-emerald-200 bg-white p-12 shadow-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-8 w-8 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
            Thanh Toán Thành Công
          </h1>
          <p className="text-center text-sm text-slate-600">
            Đã cộng{' '}
            <span className="font-black text-amber-500">{credits.toLocaleString()} credits</span>{' '}
            vào tài khoản của bạn.
          </p>
          <Link
            to="/studio"
            className="mt-4 rounded-full bg-amber-500 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:bg-amber-600"
          >
            Vào Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 px-4">
      <div className="flex flex-col items-center gap-4 rounded-[2.5rem] border border-red-200 bg-white p-12 shadow-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-500"
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
          Xác Nhận Thất Bại
        </h1>
        <p className="text-center text-sm text-slate-600">
          Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ nếu tiền đã bị trừ.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 rounded-full border border-slate-300 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:border-amber-500 hover:text-amber-500"
        >
          Về Trang Chủ
        </button>
      </div>
    </div>
  );
};
