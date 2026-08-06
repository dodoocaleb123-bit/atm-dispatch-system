import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* App Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        
        {/* Theme Color for Browser Header */}
        <meta name="theme-color" content="#9333ea" />
      </Head>
      <body className="bg-slate-950 text-slate-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}