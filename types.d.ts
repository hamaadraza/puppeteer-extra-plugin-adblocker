// Fix for incorrect generic type declarations in @ghostery/adblocker
declare module '@ghostery/adblocker' {
  export const EMPTY_UINT8_ARRAY: Uint8Array;
  export const EMPTY_UINT32_ARRAY: Uint32Array;
}

declare module '@ghostery/adblocker-puppeteer' {
  export * from '@ghostery/adblocker';
} 