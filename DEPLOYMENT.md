# Deployment Guide — Melodai (Vercel + Custom Domain)

## Tổng quan

| Service          | Platform        | Domain                    |
| ---------------- | --------------- | ------------------------- |
| Frontend (React) | Vercel          | `melodai.app`             |
| Backend (NestJS) | Vercel          | `api.melodai.app`         |
| Database         | Neon PostgreSQL | (cloud, không cần domain) |

**Chỉ cần mua 1 domain** — subdomain `api.melodai.app` miễn phí, không tốn thêm.

---

## Giới hạn Vercel cần biết

### 1. Timeout serverless function

- **Free plan**: tối đa 60 giây
- **Pro plan**: tối đa 300 giây
- Đã config trong `be/vercel.json`: `"maxDuration": 60`

Các endpoint có thể timeout với bài hát dài (> 4 phút):

- `POST /api/genai/sync-karaoke` — Gemini + Whisper song song, ~30–90s
- `POST /api/genai/transcribe` — Gemini multimodal, ~10–30s

**Nếu bị timeout thường xuyên**: nâng lên Vercel Pro ($20/tháng) để có 300s,
hoặc chuyển BE sang Railway/Render.

### 2. File upload giới hạn 4.5MB

Vercel serverless hard-limit **request body 4.5MB** — không thể bypass bằng code.

Ảnh hưởng:

- Audio file > 4.5MB sẽ bị lỗi 413 khi upload lên `/transcribe` hoặc `/sync-karaoke`

Workaround hiện tại: yêu cầu user nén audio trước khi upload (MP3 128kbps,
bài ~4 phút = ~4MB). Nếu cần hỗ trợ file lớn hơn, cần dùng pre-signed upload
(Cloudinary / S3) thay vì upload trực tiếp qua BE.

### 3. Cold start

Request đầu tiên sau khi serverless idle ~1–3 giây chậm hơn bình thường.
Không fix được, chấp nhận.

### 4. ffmpeg-static — ĐÃ XÓA

Endpoint `POST /api/genai/extract-instrumental` đã bị xóa vì `ffmpeg-static`
không chạy được trên Vercel serverless. Thay thế bằng client-side vocal removal
(Web Audio API) trong Karaoke Studio và Karaoke Pro — miễn phí, không tốn credits.

---

## Quy trình deploy

### Bước 1: Push code lên GitHub

```bash
git push origin main
```

Vercel tự động deploy khi phát hiện push (nếu đã connect repo).

### Bước 2: Environment variables trên Vercel BE

Vào: Vercel Dashboard → BE project → Settings → Environment Variables

```
DATABASE_URL          = postgresql://... (Neon connection string)
JWT_SECRET            = <random 64 chars>
JWT_REFRESH_SECRET    = <random 64 chars>
GEMINI_API_KEY        = <Google AI Studio key>
GROQ_API_KEY          = <Groq key, optional>
PAYOS_CLIENT_ID       = <PayOS>
PAYOS_API_KEY         = <PayOS>
PAYOS_CHECKSUM_KEY    = <PayOS>
FRONTEND_URL          = https://melodai.app
ALLOWED_ORIGINS       = https://melodai.app
```

### Bước 3: Environment variables trên Vercel FE

```
VITE_API_BASE_URL     = https://api.melodai.app
```

### Bước 4: Thêm custom domain

**FE project** → Settings → Domains:

- Thêm `melodai.app`
- Thêm `www.melodai.app` (redirect về `melodai.app`)

**BE project** → Settings → Domains:

- Thêm `api.melodai.app`

### Bước 5: DNS records (trong Cloudflare hoặc registrar)

| Type  | Name  | Value                  | Proxy          |
| ----- | ----- | ---------------------- | -------------- |
| A     | `@`   | `76.76.21.21`          | OFF (DNS only) |
| CNAME | `www` | `cname.vercel-dns.com` | OFF            |
| CNAME | `api` | `cname.vercel-dns.com` | OFF            |

> **Quan trọng**: Tắt Cloudflare proxy (icon cloud → xám) cho tất cả record trỏ về Vercel,
> để Vercel tự cấp SSL certificate qua Let's Encrypt. Nếu bật proxy, SSL sẽ bị conflict.

---

## PayOS Webhook

Sau khi có domain, cập nhật webhook URL trong PayOS dashboard:

```
https://api.melodai.app/api/payment/webhook
```

---

## Cron job

Đã config trong `be/vercel.json`:

```json
{
  "path": "/api/cron/expire-credits",
  "schedule": "0 0 * * *"
}
```

Chạy lúc 00:00 UTC hằng ngày để expire credits hết hạn. Không cần cron-job.org.

> Vercel Cron chỉ hoạt động với **Pro plan** trở lên. Free plan không chạy cron.
> Nếu dùng Free plan, cần dùng cron-job.org gọi `GET https://api.melodai.app/api/cron/expire-credits`.

---

## Kiểm tra sau deploy

```bash
# BE health check
curl https://api.melodai.app/api/health

# Swagger docs
open https://api.melodai.app/api/docs

# FE
open https://melodai.app
```

---

## Nâng cấp khi cần

| Vấn đề                          | Giải pháp                             |
| ------------------------------- | ------------------------------------- |
| Sync-karaoke timeout (bài dài)  | Nâng Vercel Pro ($20/tháng)           |
| File upload > 4.5MB             | Tích hợp Cloudinary pre-signed upload |
| Cron không chạy (Free plan)     | Dùng cron-job.org hoặc nâng Pro       |
| Quá nhiều requests (rate limit) | Thêm Redis cache / queue              |
