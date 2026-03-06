import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Clock,
  History,
  Lock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Coins,
} from 'lucide-react';
import { useGetMyPackages, useGetCreditTransactions } from '../services/endpoints/credits';
import { useUpdateMyProfile, useChangePassword } from '../services/endpoints/users';
import type { PackageBreakdownDto } from '../services/models/packageBreakdownDto';
import { useAuthStore } from '../stores/authStore';
import { ALL_ROUTER } from '../routes';

type Tab = 'credits' | 'history' | 'security';

const TAB_LIST: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'credits', label: 'Credits của tôi', icon: <Coins className="h-4 w-4" /> },
  { id: 'history', label: 'Lịch sử mua', icon: <History className="h-4 w-4" /> },
  { id: 'security', label: 'Bảo mật', icon: <Lock className="h-4 w-4" /> },
];

function formatDate(d: string | Date | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function PackageStatusBadge({
  isExpired,
  daysUntilExpiry,
}: {
  isExpired: boolean;
  daysUntilExpiry: number | null;
}) {
  if (isExpired) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-400">
        <XCircle className="h-2.5 w-2.5" /> Hết hạn
      </span>
    );
  }
  if (daysUntilExpiry !== null && daysUntilExpiry <= 7) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-400">
        <AlertTriangle className="h-2.5 w-2.5" /> Còn {daysUntilExpiry} ngày
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-400">
      <CheckCircle className="h-2.5 w-2.5" /> Còn hiệu lực
    </span>
  );
}

function CreditsTab() {
  const { data, isLoading } = useGetMyPackages();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const packages = data?.packages ?? [];
  const active = packages.filter((p) => !p.isExpired);
  const expired = packages.filter((p) => p.isExpired);

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Khả dụng', value: data?.availableCredits ?? 0, color: 'text-amber-400' },
          { label: 'Đã dùng', value: data?.usedCredits ?? 0, color: 'text-slate-400' },
          { label: 'Tổng mua', value: data?.totalCredits ?? 0, color: 'text-slate-300' },
          { label: 'Đã hết hạn', value: data?.expiredCredits ?? 0, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
          >
            <p className={`text-2xl font-black tabular-nums ${color}`}>{value.toLocaleString()}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              {label}
            </p>
          </div>
        ))}
      </div>

      {(data?.creditsExpiringSoon ?? 0) > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-[11px] font-bold text-amber-300">
            <span className="text-amber-400">{data?.creditsExpiringSoon}</span> credits sẽ hết hạn
            trong 7 ngày tới
          </p>
        </div>
      )}

      {/* Active packages */}
      <div>
        <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          Gói đang hoạt động ({active.length})
        </h3>
        {active.length === 0 ? (
          <p className="py-6 text-center text-[11px] text-slate-600">
            Chưa có gói nào đang hoạt động
          </p>
        ) : (
          <div className="space-y-2">
            {active.map((pkg) => (
              <PackageRow key={pkg.ledgerId} pkg={pkg} />
            ))}
          </div>
        )}
      </div>

      {/* Expired packages */}
      {expired.length > 0 && (
        <div>
          <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
            Gói đã hết hạn ({expired.length})
          </h3>
          <div className="space-y-2 opacity-50">
            {expired.map((pkg) => (
              <PackageRow key={pkg.ledgerId} pkg={pkg} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PackageRow({ pkg }: { pkg: PackageBreakdownDto }) {
  const pct = pkg.creditsTotal > 0 ? Math.round((pkg.creditsUsed / pkg.creditsTotal) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-black text-slate-200">{pkg.packageName}</span>
            <PackageStatusBadge
              isExpired={pkg.isExpired}
              daysUntilExpiry={pkg.daysUntilExpiry ?? null}
            />
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Mua: {formatDate(pkg.purchasedAt)}
            </span>
            {pkg.expiresAt && (
              <span className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Hết hạn: {formatDate(pkg.expiresAt)}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[13px] font-black tabular-nums text-amber-400">
            {pkg.creditsRemaining.toLocaleString()}
            <span className="text-[10px] text-slate-500">
              {' '}
              / {pkg.creditsTotal.toLocaleString()}
            </span>
          </p>
          <p className="text-[10px] text-slate-600">còn lại</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-amber-500/60 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-right text-[9px] text-slate-600">
        Đã dùng {pct}% · {pkg.creditsUsed.toLocaleString()} credits
      </p>
    </div>
  );
}

function HistoryTab() {
  const { data, isLoading } = useGetCreditTransactions({ page: 1, limit: 20 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const transactions = data?.data ?? [];

  return (
    <div>
      <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
        Lịch sử giao dịch
      </h3>
      {transactions.length === 0 ? (
        <p className="py-10 text-center text-[11px] text-slate-600">Chưa có giao dịch nào</p>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div>
                <p className="text-[12px] font-bold text-slate-200">
                  {(tx as unknown as { package?: { name: string } }).package?.name ?? 'Credits'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {formatDate((tx as unknown as { purchaseDate?: string }).purchaseDate)} ·{' '}
                  {(tx as unknown as { paymentMethod?: string }).paymentMethod ?? 'manual'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-black text-emerald-400">
                  +
                  {(
                    tx as unknown as { creditsPurchased: number }
                  ).creditsPurchased.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500">
                  {Number((tx as unknown as { amount: number }).amount).toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SecurityTab() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const { mutate: updateProfile, isPending: updatingProfile } = useUpdateMyProfile({
    mutation: {
      onSuccess: () => {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      },
    },
  });

  const { mutate: changePw, isPending: changingPw } = useChangePassword({
    mutation: {
      onSuccess: () => {
        setPwSuccess(true);
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
        setTimeout(() => {
          setPwSuccess(false);
          navigate(ALL_ROUTER.PUBLIC.AUTH);
        }, 2000);
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
        setPwError(msg ?? 'Có lỗi xảy ra');
      },
    },
  });

  const handleSaveProfile = () => {
    updateProfile({ data: { fullName } });
  };

  const handleChangePassword = () => {
    setPwError('');
    if (newPw !== confirmPw) {
      setPwError('Mật khẩu mới không khớp');
      return;
    }
    if (newPw.length < 8) {
      setPwError('Mật khẩu mới tối thiểu 8 ký tự');
      return;
    }
    changePw({ data: { currentPassword: currentPw, newPassword: newPw } });
  };

  return (
    <div className="space-y-8">
      {/* Profile */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          Thông tin tài khoản
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Email
            </label>
            <input
              disabled
              value={user?.email ?? ''}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-400 outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Tên hiển thị
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập tên của bạn"
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-200 outline-none transition-colors focus:border-amber-500/40 focus:bg-amber-500/5"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={updatingProfile}
            className="flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:bg-amber-400 disabled:opacity-50"
          >
            {profileSaved ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            {profileSaved ? 'Đã lưu!' : updatingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          Đổi mật khẩu
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Mật khẩu hiện tại', value: currentPw, onChange: setCurrentPw },
            { label: 'Mật khẩu mới', value: newPw, onChange: setNewPw },
            { label: 'Xác nhận mật khẩu mới', value: confirmPw, onChange: setConfirmPw },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                {label}
              </label>
              <input
                type="password"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-200 outline-none transition-colors focus:border-amber-500/40 focus:bg-amber-500/5"
              />
            </div>
          ))}

          {pwError && (
            <p className="flex items-center gap-1.5 text-[11px] text-red-400">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {pwError}
            </p>
          )}
          {pwSuccess && (
            <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5 shrink-0" /> Đổi mật khẩu thành công! Đang chuyển
              hướng...
            </p>
          )}

          <button
            onClick={handleChangePassword}
            disabled={changingPw || !currentPw || !newPw || !confirmPw}
            className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
          >
            <Lock className="h-3.5 w-3.5" />
            {changingPw ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </button>
        </div>
      </div>
    </div>
  );
}

export const AccountPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('credits');
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-[#06080f] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-lg font-black text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            {user?.email?.[0].toUpperCase() ?? '?'}
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-widest text-white">
              {user?.fullName ?? 'Tài khoản'}
            </h1>
            <p className="text-[11px] text-slate-500">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1">
          {TAB_LIST.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'credits' && <CreditsTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
};
