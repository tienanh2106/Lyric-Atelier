import { useNavigate } from 'react-router-dom';
import { useGetCreditPackages } from '../../services/endpoints/credits';
import { useCreatePaymentLink } from '../../services/endpoints/payment';
import { useAuthStore } from '../../stores/authStore';
import { Check, Zap } from 'lucide-react';

export const PackagesSection = () => {
  const { data: packages, isLoading } = useGetCreditPackages();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const {
    mutate: createLink,
    isPending,
    variables,
  } = useCreatePaymentLink({
    mutation: {
      onSuccess: (result) => {
        if (result?.checkoutUrl) {
          globalThis.location.href = result.checkoutUrl;
        }
      },
      onError: () => {
        alert('Không thể tạo link thanh toán. Vui lòng thử lại.');
      },
    },
  });

  const handleChoosePackage = (pkgId: string) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    createLink({ data: { packageId: pkgId } });
  };

  const isLoadingPkg = (pkgId: string) => isPending && variables?.data?.packageId === pkgId;

  // Mark middle package as featured if 3 or more exist
  const getFeatured = (index: number, total: number) =>
    total >= 3 && index === Math.floor(total / 2);

  return (
    <section id="pricing" className="relative bg-[#06080f] px-6 py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
            Gói Credits
          </span>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[1.4] tracking-tight text-white">
            Chọn Gói
            <br />
            <span className="text-slate-500">Phù Hợp</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-500">
            Mua credits một lần, dùng cho tất cả công cụ. Không có phí thuê bao ẩn.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packages?.map((pkg, index) => {
              const isFeatured = getFeatured(index, packages.length);
              return (
                <div
                  key={pkg.id}
                  className={`group relative flex flex-col gap-7 rounded-[2.5rem] p-8 transition-all ${
                    isFeatured
                      ? 'border-2 border-amber-500/50 bg-amber-500/[0.06] shadow-[0_0_60px_rgba(245,158,11,0.12)]'
                      : 'border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Featured badge */}
                  {isFeatured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-1">
                        <Zap className="h-3 w-3 text-black" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-black">
                          Phổ Biến
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Name + Description */}
                  <div>
                    <h3 className="mb-1 text-lg font-black uppercase tracking-widest text-white">
                      {pkg.name}
                    </h3>
                    {pkg.description && (
                      <p className="text-[11px] leading-relaxed text-slate-500">
                        {pkg.description}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-4xl font-black tabular-nums ${
                        isFeatured
                          ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                          : 'text-slate-100'
                      }`}
                    >
                      {pkg.price.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-slate-600">VNĐ</span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-6">
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span className="text-[12px] font-semibold text-slate-300">
                        {pkg.credits.toLocaleString()} Credits
                      </span>
                    </div>
                    {pkg.validityDays && (
                      <div className="flex items-center gap-3">
                        <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                        <span className="text-[12px] font-semibold text-slate-300">
                          Hiệu lực {pkg.validityDays} ngày
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span className="text-[12px] font-semibold text-slate-300">
                        Dùng tất cả công cụ AI
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleChoosePackage(pkg.id)}
                    disabled={isLoadingPkg(pkg.id)}
                    className={`mt-auto rounded-full py-3.5 text-[10px] font-black uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                      isFeatured
                        ? 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.98]'
                        : 'border border-white/[0.1] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    {isLoadingPkg(pkg.id) ? 'Đang xử lý...' : 'Chọn Gói'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-slate-600">
          Thanh toán an toàn qua PayOS. Credits không có hạn sử dụng trừ khi gói có ghi rõ.
        </p>
      </div>
    </section>
  );
};
