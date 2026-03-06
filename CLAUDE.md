# CLAUDE.md — Lyric Atelier / MelodAI

Tài liệu kỹ thuật nội bộ cho AI assistant. Đọc kỹ trước khi viết bất kỳ code nào.

---

## 1. Kiến trúc tổng quan

```
be/   NestJS + TypeORM + PostgreSQL
fe/   React + Vite + TypeScript + TailwindCSS + React Query (TanStack v5)
```

### BE port: 3123 | FE port: 5173

---

## 2. Quy tắc bắt buộc

### 2.1 Sau mọi thay đổi BE controller/DTO → PHẢI generate API

```bash
# Khởi động BE trước (swagger cần chạy)
cd be && npm run start:dev

# Sau khi BE ready (port 3123):
cd fe && npm run generate:api
```

**Không bao giờ** tự tay tạo hoặc sửa file trong:

- `fe/src/services/endpoints/`
- `fe/src/services/models/`

Tất cả file đó do orval sinh ra tự động.

### 2.2 Migration khi thay đổi schema DB

```bash
cd be
npx typeorm-ts-node-commonjs migration:generate src/database/migrations/<TênMigration> -d src/database/data-source.ts
npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts
```

**Không dùng `synchronize: true`** — luôn dùng migration.

---

## 3. Response wrapping — quan trọng nhất

### BE: `ResponseInterceptor` bọc mọi response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": <payload thực sự>,
  "timestamp": "...",
  "path": "..."
}
```

Nếu controller trả `{ message, data }` → interceptor đặt `data.data` = payload.
Nếu controller trả object trực tiếp → interceptor đặt `data` = toàn bộ object.

### FE: `axiosInstance` unwrap tự động

```ts
// fe/src/services/custom-instance.ts line ~161:
.then(({ data }) => data.data)
```

**Hệ quả:** Hook orval trả về payload đã unwrap một lần.

```ts
// SAI — unwrap thêm lần nữa:
const result = useGetSomething();
result.data.data.field; // ❌

// ĐÚNG:
result.data
  .field(
    // ✅

    // SAI — cast sai khi truy cập generatedText:
    result as { data: { generatedText: string } },
  )
  .data.generatedText(
    // ❌

    // ĐÚNG:
    result as unknown as { generatedText: string },
  ).generatedText; // ✅
```

---

## 4. Hệ thống Credits

### 4.1 Bảng dữ liệu

| Bảng                  | Vai trò                                    |
| --------------------- | ------------------------------------------ |
| `credit_packages`     | Danh mục gói bán (Starter/Boost/Pro/Ultra) |
| `credit_transactions` | Lịch sử giao dịch mua (1 row/lần mua)      |
| `credit_ledger`       | Sổ cái chi tiết — nguồn sự thật về credits |
| `user_credit_summary` | Bộ đếm tổng hợp (cache của ledger)         |

### 4.2 Quy ước `credit_ledger` — KHÔNG ĐƯỢC NHẦM

| Cột              | Ý nghĩa                          | Ví dụ               |
| ---------------- | -------------------------------- | ------------------- |
| `debit`          | Credits **ĐI VÀO** tài khoản     | PURCHASE: 100       |
| `credit`         | Credits **ĐÃ DÙNG** từ entry này | Sau khi dùng 30: 30 |
| `balance`        | Số dư tổng sau giao dịch này     | 100                 |
| `debit - credit` | Credits **CÒN LẠI** trong entry  | 70                  |

**FIFO deduction**: deduct từ entry có `expiresAt` sớm nhất trước.

```ts
// PURCHASE entry đúng:
{ debit: 100, credit: 0 }   // còn 100

// ADMIN_ADJUSTMENT entry đúng:
{ debit: 100, credit: 0 }   // còn 100

// USAGE entry đúng:
{ debit: 0, credit: 30 }    // ghi lại đã dùng 30

// SAI (seed cũ viết ngược):
{ debit: 0, credit: 100 }   // availableInEntry = -100 → FIFO skip luôn ❌
```

### 4.3 Các `CreditTransactionType`

```ts
PURCHASE; // User mua gói — CÓ credit_transaction đi kèm
ADMIN_ADJUSTMENT; // Admin cấp/trừ thủ công, hoặc seed test accounts — KHÔNG có credit_transaction
USAGE; // User dùng credits (AI operation)
EXPIRATION; // Credits hết hạn (do cron tạo)
REFUND; // Hoàn tiền
```

**Test accounts dùng `ADMIN_ADJUSTMENT`**, không dùng `PURCHASE` (vì không có giao dịch thanh toán thật).

### 4.4 `getMyPackages` chỉ hiện PURCHASE entries

`GET /credits/my-packages` query `type = PURCHASE`. Credits từ `ADMIN_ADJUSTMENT` (test accounts, admin grant) sẽ **không hiện trong tab "Gói của tôi"** nhưng vẫn hoạt động bình thường.

### 4.5 Cron hết hạn: `EVERY_DAY_AT_MIDNIGHT`

Điều kiện tìm entries hết hạn:

```ts
{ isExpired: false, expiresAt: LessThan(now) }  // ✅ ĐÚNG
{ isExpired: false, expiresAt: MoreThan(now) }   // ❌ SAI (bug đã fix)
```

### 4.6 Locks bắt buộc để tránh race condition

Mọi hàm đọc `user_credit_summary` rồi cập nhật đều phải có:

```ts
lock: {
  mode: "pessimistic_write";
}
```

Đã áp dụng cho: `deductCredits`, `purchaseCredits`, `adjustCredits`, `expireCredits`.

### 4.7 Sau FIFO loop phải kiểm tra `remainingAmount`

```ts
if (remainingAmount > 0) {
  throw new BadRequestException({ errorCode: ErrorCode.INSUFFICIENT_CREDITS, ... });
}
```

Tình huống xảy ra: `summary.availableCredits` tính cả credits đã hết hạn (cron chưa chạy) → summary báo đủ nhưng FIFO không tìm được entries hợp lệ.

### 4.8 Tính phí credits

```ts
// Dynamic (scale theo số từ):
cost = max(MIN_COST, baseCost + ceil(wordCount × ratePerWord))

// Fixed:
cost = fixed
```

Xem toàn bộ config tại `be/src/config/credits.config.ts`.

---

## 5. Payment flow (PayOS)

```
FE PackagesSection
  → POST /api/payment/create-link  { packageId }
  → redirect đến checkoutUrl
  → PayOS xử lý
  → GET /payment/return?packageId=&orderCode=   (FE PaymentReturnPage)
  → POST /api/payment/confirm  { packageId, orderCode }
  → verify với PayOS API → grant credits
```

**Idempotency**: `isOrderProcessed(orderCode)` check trước khi grant. Dùng `orderCode` làm `paymentTransactionId`.

**PayOS SDK v2**: `payos.paymentRequests.create()` / `payos.paymentRequests.get()` / `payos.webhooks.verify()`.

---

## 6. Auth

- **Access token**: JWT ngắn hạn (header `Authorization: Bearer`)
- **Refresh token**: Rotation — token cũ bị revoke ngay khi dùng
- **Max sessions**: 5 per user (oldest bị revoke)
- **Token reuse attack**: Phát hiện token đã revoke → revoke toàn bộ sessions của user
- `@Public()` decorator bypass JwtAuthGuard
- `@Roles(Role.ADMIN)` yêu cầu role admin

---

## 7. Database — Seeds

### Chạy seed

```bash
cd be
npx ts-node src/database/seeds/credit-packages.seed.ts
npx ts-node src/database/seeds/test-accounts.seed.ts
```

### Test accounts (10 tài khoản)

- 100 credits/account, loại `ADMIN_ADJUSTMENT`, `expiresAt = +365 ngày`
- Seed có skip logic: chạy lại an toàn (không tạo duplicate)

### Seed credit_ledger đúng cách

```ts
// ĐÚNG cho ADMIN_ADJUSTMENT:
{ type: 'ADMIN_ADJUSTMENT', debit: CREDITS, credit: 0, balance: CREDITS }

// ĐÚNG cho PURCHASE (trong purchaseCredits service):
{ type: 'PURCHASE', debit: pkg.credits, credit: 0, balance: newBalance }
```

---

## 8. GenAI — Luồng deduct credits

```
1. getCreditBalance(userId)        // check nhanh (pre-flight, không lock)
2. Gọi AI API (Gemini / Groq)      // chỉ khi đủ credits
3. deductCredits(userId, cost)     // trong DB transaction có lock
```

**Lý do tách**: tránh gọi AI rồi mới phát hiện không đủ credits.

**Không deduct nếu AI call fail**: `deductCredits` chỉ gọi sau khi có `generatedText`.

### Models đang dùng

| Model                          | Dùng cho                  |
| ------------------------------ | ------------------------- |
| `gemini-2.5-flash`             | Mặc định — nhanh, rẻ      |
| `gemini-2.5-pro-preview-06-05` | Thinking — chất lượng cao |
| Groq `whisper-large-v3-turbo`  | Transcribe audio          |

---

## 9. FE — Patterns

### 9.1 Orval hooks

```ts
// Luôn destructure đúng cách:
const { data, isLoading, error } = useGetSomething();
// data đã unwrap → dùng trực tiếp: data.field (không phải data.data.field)

// Mutation:
const { mutate, isPending } = useSomeMutation({
  mutation: {
    onSuccess: (result) => { /* result đã unwrap */ },
    onError: (err) => { /* handle error */ },
  },
});
mutate({ data: { ... } });
```

### 9.2 Truy cập binary response (arraybuffer)

`axiosInstance` không dùng được cho binary response vì nó unwrap JSON. Dùng raw axios:

```ts
// fe/src/services/karaokeService.ts
import axios from "axios";
import { getAccessToken } from "./custom-instance";

const { data } = await axios.post<ArrayBuffer>(url, formData, {
  responseType: "arraybuffer",
  headers: { Authorization: `Bearer ${getAccessToken()}` },
});
```

### 9.3 Routes

```ts
// fe/src/routes/index.tsx
ALL_ROUTER = {
  PUBLIC: { HOME, AUTH, PAYMENT_CANCEL },
  PRIVATE: {
    STUDIO,
    ACCOUNT,
    PAYMENT_RETURN,
    KARAOKE_STUDIO,
    KARAOKE_PRO,
    NEON_PULSE,
  },
};
```

`ProtectedRoute` bọc tất cả PRIVATE routes — redirect về `/auth` nếu chưa đăng nhập.

### 9.4 Auth store

```ts
const { user, isAuthenticated, isInitialized, logout } = useAuthStore();
// isInitialized: false khi đang check token lúc khởi động → hiện skeleton
```

### 9.5 Canvas + Audio (NeonPulse, KaraokeStudio)

- `useRef<number | null>(null)` — React 19 yêu cầu initial value cho useRef
- Canvas render loop phải chạy ngay cả khi không có `analyser` (dùng `dataArray.fill(0)`)
- Background image: dùng state `bgImageLoaded` để trigger re-render sau `img.onload`
- Export video: `canvas.captureStream(30)` + `MediaRecorder` → WebM → `@ffmpeg/ffmpeg` → MP4
- Google Fonts inject động qua `document.createElement('link')` trong `useEffect`

---

## 10. Các lỗi đã gặp — KHÔNG lặp lại

### Credits service

| Lỗi                                           | Mô tả                                         | Fix                                                      |
| --------------------------------------------- | --------------------------------------------- | -------------------------------------------------------- |
| `MoreThan(now)` trong `expireCredits`         | Tìm ngược — entries chưa hết hạn              | `LessThan(now)`                                          |
| Không check `expiresAt > now` trong FIFO      | Dùng được credits đã hết hạn (cron chưa chạy) | Thêm `expiresAt: IsNull()` OR `expiresAt: MoreThan(now)` |
| Không check `remainingAmount > 0` sau FIFO    | Phantom credits khi summary stale             | Throw `INSUFFICIENT_CREDITS`                             |
| Không lock summary trong `purchaseCredits`    | Race condition mất credits                    | `lock: pessimistic_write`                                |
| `expireCredits` balance âm khi concurrent     | Trừ credits đã được dùng rồi                  | `Math.min(availableInEntry, currentAvailable)`           |
| `creditsExpiringSoon` tính cả entries quá khứ | User thấy số sai                              | Thêm `expiresAt > now` vào query                         |

### Seed script

| Lỗi                               | Mô tả                                  | Fix                   |
| --------------------------------- | -------------------------------------- | --------------------- |
| `debit=0, credit=100` trong seed  | FIFO skip vì `availableInEntry = -100` | `debit=100, credit=0` |
| Dùng `PURCHASE` cho test accounts | Không có `credit_transaction` đi kèm   | `ADMIN_ADJUSTMENT`    |

### FE

| Lỗi                                  | Mô tả                               | Fix                                                              |
| ------------------------------------ | ----------------------------------- | ---------------------------------------------------------------- |
| `result.data.generatedText`          | axiosInstance đã unwrap một lần     | `(result as unknown as { generatedText: string }).generatedText` |
| `axiosInstance` cho binary response  | Unwrapper JSON fail với arraybuffer | Dùng raw `axios` với `responseType: 'arraybuffer'`               |
| `'add'` làm GlobalCompositeOperation | Không hợp lệ                        | Dùng `'lighter'`                                                 |
| `onSuccess` trong try/catch          | State update bị catch nuốt          | Set state TRƯỚC try/catch                                        |

### PayOS SDK

| Lỗi                                | Mô tả                                              |
| ---------------------------------- | -------------------------------------------------- |
| `payos.createPaymentLink()`        | API cũ (v1). Dùng `payos.paymentRequests.create()` |
| `payos.verifyPaymentWebhookData()` | API cũ (v1). Dùng `payos.webhooks.verify()`        |

---

## 11. Checklist trước khi commit

- [ ] `npx tsc --noEmit` không có lỗi (cả `be/` và `fe/`)
- [ ] Nếu đổi BE controller/DTO → đã chạy `npm run generate:api`
- [ ] Nếu đổi DB schema → đã tạo và chạy migration
- [ ] Credit ledger mới: `debit = credits IN`, `credit = 0` (không phải ngược lại)
- [ ] Mọi hàm đọc-rồi-ghi `user_credit_summary` đều có `pessimistic_write` lock
- [ ] Seed script mới: test với `[SKIP]` logic (chạy lại không tạo duplicate)
