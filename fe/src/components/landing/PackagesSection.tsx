import { useNavigate } from 'react-router-dom';
import { useGetCreditPackages } from '../../services/endpoints/credits';
import { useCreatePaymentLink } from '../../services/endpoints/payment';
import { useAuthStore } from '../../stores/authStore';

export const PackagesSection = () => {
  const { data: packages, isLoading } = useGetCreditPackages();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const { mutate: createLink, isPending, variables } = useCreatePaymentLink({
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

  const isLoadingPkg = (pkgId: string) =>
    isPending && variables?.data?.packageId === pkgId;

  return (
    <section className="animate-in fade-in slide-in-from-bottom-12 flex flex-col gap-12 py-20 delay-150 duration-1000">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
          Gói Credits
        </span>
        <h2 className="text-3xl font-black uppercase tracking-wider text-slate-900 md:text-4xl">
          Chọn Gói Phù Hợp
        </h2>
        <p className="max-w-2xl text-sm text-slate-600">
          Mua credits để sử dụng studio. Mỗi lần tạo lời bài hát sẽ tiêu tốn một lượng credits tùy
          theo độ dài.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages?.map((pkg) => (
            <div
              key={pkg.id}
              className="glass-panel group flex flex-col gap-6 rounded-[2.5rem] border border-slate-200 p-8 transition-all hover:border-amber-500/40 hover:shadow-2xl"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-900">
                  {pkg.name}
                </h3>
                {pkg.description && <p className="text-[11px] text-slate-600">{pkg.description}</p>}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-amber-500">
                  {pkg.price.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-slate-600">VNĐ</span>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[11px] font-bold text-slate-700">
                    {pkg.credits.toLocaleString()} Credits
                  </span>
                </div>
                {pkg.validityDays && (
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[11px] font-bold text-slate-700">
                      Có hiệu lực {pkg.validityDays} ngày
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleChoosePackage(pkg.id)}
                disabled={isLoadingPkg(pkg.id)}
                className="mt-auto rounded-full border border-amber-500 bg-transparent px-6 py-3 text-[10px] font-black uppercase tracking-widest text-amber-500 transition-all hover:bg-amber-500 hover:text-white hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:cursor-not-allowed disabled:opacity-50 group-hover:scale-[1.02]"
              >
                {isLoadingPkg(pkg.id) ? 'Đang xử lý...' : 'Chọn Gói'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
