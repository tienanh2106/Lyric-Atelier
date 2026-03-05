import React from 'react';
import { Scissors, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';

interface Props {
  isProcessing: boolean;
  instrumentalUrl: string | null;
  useInstrumental: boolean;
  error: string | null;
  onProcess: () => void;
  onToggle: () => void;
}

export const VocalRemovalStepPro: React.FC<Props> = ({
  isProcessing,
  instrumentalUrl,
  useInstrumental,
  error,
  onProcess,
  onToggle,
}) => (
  <div className="space-y-5 p-4">
    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
      Tách Vocal
    </div>

    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-center">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/20">
          <Scissors className="h-7 w-7 text-violet-400" />
        </div>
      </div>
      <h3 className="mb-2 text-sm font-black uppercase text-white">Web Audio Phase Cancellation</h3>
      <p className="mb-6 text-[11px] text-slate-500">
        Tách vocal bằng thuật toán phase cancellation (L-R) trực tiếp trên trình duyệt. Miễn phí,
        không cần server. Hiệu quả với nhạc stereo thông thường.
      </p>

      {!instrumentalUrl ? (
        <button
          onClick={onProcess}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 rounded-2xl bg-violet-500/20 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-violet-300 ring-1 ring-violet-500/30 transition-all hover:bg-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Scissors className="h-4 w-4" />
          {isProcessing ? 'Đang tách vocal...' : 'Bắt Đầu Tách Vocal'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl bg-emerald-500/10 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-emerald-400">
            Tách vocal thành công!
          </div>

          {/* Preview */}
          <audio controls src={instrumentalUrl} className="w-full rounded-xl" />

          {/* Toggle */}
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-all hover:border-violet-500/30"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Dùng nhạc không lời
            </span>
            {useInstrumental ? (
              <ToggleRight className="h-5 w-5 text-violet-400" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-slate-600" />
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-left">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-[11px] text-amber-400">{error}</p>
        </div>
      )}
    </div>

    <p className="text-center text-[10px] text-slate-700">
      Lưu ý: Kết quả tốt nhất với nhạc stereo, vocal đặt ở trung tâm. Không dùng credits.
    </p>
  </div>
);
