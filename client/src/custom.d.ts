// client/src/vite-env.d.ts
/// <reference types="vite/client" />

declare module '*.png' {
  const value: string; 
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}
// Thêm các kiểu file khác nếu cần