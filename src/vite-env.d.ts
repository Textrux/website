/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Declare module types for CSV files imported as raw text
declare module "*.csv?raw" {
  const content: string;
  export default content;
}
