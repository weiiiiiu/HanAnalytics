// src/types/vh-plugin.d.ts
declare module 'vh-plugin' {
  interface VhPlugin {
    showLoading: () => void;
    hideLoading: () => void;
  }

  const vh: VhPlugin;

  export default vh;
}
