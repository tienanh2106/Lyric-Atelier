# Project Structure

Dự án được tổ chức theo cấu trúc module-based với TanStack Query và Axios.

## 📁 Cấu Trúc Thư Mục

```
Lyric-Atelier/
├── src/
│   ├── components/          # React components
│   │   ├── Banner.tsx
│   │   ├── LyricInput.tsx
│   │   └── LyricResult.tsx
│   │
│   ├── services/            # API services và business logic
│   │   ├── api/            # TanStack Query hooks
│   │   │   ├── example.ts  # Example CRUD hooks
│   │   │   └── lyrics.ts   # Lyrics API hooks
│   │   ├── custom-instance.ts   # Axios configuration
│   │   ├── queryClient.ts       # React Query config
│   │   ├── geminiService.ts     # Gemini AI service
│   │   └── index.ts            # Service exports
│   │
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Shared types
│   │
│   ├── utils/              # Utility functions
│   │   └── toneHelper.ts   # Tone/phonetics helpers
│   │
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Application entry point
│   ├── global.css          # Global styles
│   └── vite-env.d.ts       # Vite environment types
│
├── orval.config.ts         # Orval code generation config
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS config
└── package.json            # Dependencies
```

## 🔧 Path Aliases

Vite được cấu hình với các path aliases:

```typescript
'@'          -> './src'
'@components' -> './src/components'
'@services'   -> './src/services'
'@types'      -> './src/types'
'@utils'      -> './src/utils'
```

**Sử dụng:**

```typescript
// Thay vì:
import { Button } from '../../components/Button';

// Có thể dùng:
import { Button } from '@components/Button';
```

## 🎯 TanStack Query Setup

### Query Client Configuration

Xem file `src/services/queryClient.ts`:

- Retry: 1 lần cho queries, 0 cho mutations
- Stale time: 5 phút
- Tắt refetch on window focus

### Provider Setup

`QueryClientProvider` được setup trong `src/main.tsx`:

```tsx
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

## 📦 API Services Pattern

### 1. Axios Instance

File `src/services/custom-instance.ts` chứa:

- Base axios instance với baseURL từ env
- Request/response interceptors
- Authentication handling (có thể enable)

### 2. TanStack Query Hooks

**Query Pattern (GET requests):**

```typescript
export const useGetUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: getUsers,
  });
};
```

**Mutation Pattern (POST/PUT/DELETE):**

```typescript
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
```

### 3. Example Usage

Xem `src/services/api/example.ts` và `src/services/api/lyrics.ts` cho ví dụ chi tiết.

**Component Example:**

```tsx
import { useGetUsers, useCreateUser } from '@services';

function UsersList() {
  const { data, isLoading, error } = useGetUsers();
  const { mutate: createUser } = useCreateUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={() => createUser({ name: 'John', email: 'john@test.com' })}>
        Create User
      </button>
    </div>
  );
}
```

## 🚀 Orval Code Generation

### Generate API Code

```bash
# Generate once
npm run generate:api

# Watch mode
npm run generate:api:watch
```

Generated code sẽ được tạo trong:

- `src/services/endpoints/` - API hooks
- `src/services/models/` - TypeScript types

### Config

File `orval.config.ts`:

- Đọc OpenAPI spec từ `VITE_API_BASE_URL/api/docs-json`
- Generate React Query hooks
- Sử dụng custom axios instance
- Mode: `tags-split` (mỗi tag một file riêng)

## 🔐 Environment Variables

Tạo file `.env.local`:

````bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:2106

# Gemini API Key
VITE_GEMINI_API_KEY=your-gemini-api-key-here

## 📝 Type Definitions

### Shared Types

File `src/types/index.ts` chứa các types dùng chung:
- `LyricLine`, `LyricSection`
- `RewriteResponse`
- `GenerationConfig`

### Environment Types

File `src/vite-env.d.ts` định nghĩa types cho env variables:

```typescript
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GEMINI_API_KEY: string;
}
````

## 🎨 Styling

- **Framework:** Tailwind CSS
- **Config:** `tailwind.config.ts`
- **Global styles:** `src/global.css`
- **Fonts:** Plus Jakarta Sans, Cormorant Garamond

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
npm run format:check

# Generate API
npm run generate:api
npm run generate:api:watch
```

## 📚 Best Practices

### 1. Component Organization

- Một component = một file
- Export default cho component chính
- Export named cho utilities/helpers

### 2. API Services

- Mỗi resource có file riêng trong `services/api/`
- Sử dụng query keys factory pattern
- Invalidate queries sau mutations

### 3. Type Safety

- Luôn định nghĩa types rõ ràng
- Tránh dùng `any`
- Sử dụng generic types khi cần

### 4. Code Generation

- Không edit generated files thủ công
- Re-generate sau mỗi lần backend API thay đổi
- Wrap generated hooks nếu cần custom logic

## 🔄 Migration Path

### From Legacy to TanStack Query

Nếu bạn đang có code legacy như `geminiService.ts`:

**Before:**

```typescript
const [isLoading, setIsLoading] = useState(false);
const [data, setData] = useState(null);

const handleFetch = async () => {
  setIsLoading(true);
  try {
    const result = await rewriteLyrics(...);
    setData(result);
  } finally {
    setIsLoading(false);
  }
};
```

**After:**

```typescript
const { mutate, isPending, data } = useRewriteLyrics();

const handleFetch = () => {
  mutate({ originalText, ... });
};
```

## 📖 Additional Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Orval Docs](https://orval.dev)
- [Axios Docs](https://axios-http.com)
- [Vite Docs](https://vitejs.dev)
