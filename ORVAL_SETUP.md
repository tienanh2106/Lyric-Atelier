# Orval + Axios + React Query Setup

## Overview

This project uses Orval to automatically generate React Query hooks and TypeScript types from your OpenAPI/Swagger specification.

## Configuration Files

### 1. `orval.config.ts`

Main configuration for Orval code generation:

- Reads OpenAPI spec from `API_KEY` env variable or defaults to `http://localhost:2106/api/docs-json`
- Generates React Query hooks in `./src/services/endpoints`
- Generates TypeScript models in `./src/services/models`
- Uses custom axios instance for all API calls

### 2. `src/services/custom-instance.ts`

Custom Axios instance with:

- Base URL from `VITE_API_BASE_URL` environment variable
- Request/response interceptors
- Authorization token support (commented out, enable when needed)
- Global error handling

### 3. `src/services/queryClient.ts`

React Query client configuration:

- Retry logic (1 retry for queries, 0 for mutations)
- Stale time: 5 minutes
- Disabled refetch on window focus

## Environment Variables

Create `.env.local` file:

```bash
# Frontend API base URL
VITE_API_BASE_URL=http://localhost:2106

# Gemini API Key (if needed)
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

## Usage

### Generate API Code

```bash
# Generate once
npm run generate:api

# Watch mode (auto-regenerate on spec changes)
npm run generate:api:watch
```

### In Your Application

1. **Setup QueryClientProvider** (in your main App or index file):

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './services';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

2. **Use Generated Hooks**:

```tsx
// Import generated hooks from endpoints
import { useGetUsers, useCreateUser } from './services/endpoints/users';

function UsersList() {
  // Query
  const { data, isLoading, error } = useGetUsers();

  // Mutation
  const { mutate: createUser } = useCreateUser();

  const handleCreate = () => {
    createUser(
      { data: { name: 'John', email: 'john@example.com' } },
      {
        onSuccess: () => {
          console.log('User created successfully');
        },
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={handleCreate}>Create User</button>
    </div>
  );
}
```

## Customization

### Add Authorization Token

Uncomment in `src/services/custom-instance.ts`:

```ts
AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Custom Error Handling

Modify response interceptor in `src/services/custom-instance.ts`:

```ts
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Directory Structure

```
src/
├── services/
│   ├── custom-instance.ts    # Axios configuration
│   ├── queryClient.ts         # React Query configuration
│   ├── index.ts               # Exports
│   ├── endpoints/             # Generated API hooks (auto-generated)
│   └── models/                # Generated TypeScript types (auto-generated)
```

## Tips

- Run `npm run generate:api` after any backend API changes
- Generated files are in `src/services/endpoints/` and `src/services/models/`
- Don't manually edit generated files
- Use React Query Devtools for debugging queries
