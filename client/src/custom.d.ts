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

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.webm' {
  const src: string;
  export default src;
}