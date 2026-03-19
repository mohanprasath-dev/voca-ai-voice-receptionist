import { Public_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { ApplyThemeScript } from '@/components/app/theme-toggle';
import { cn, getAppConfig, getStyles } from '@/lib/utils';
import { Aurora } from '@/components/reactbits/Aurora';
import '@/styles/globals.css';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

const commitMono = localFont({
  display: 'swap',
  variable: '--font-commit-mono',
  src: [
    { path: '../fonts/CommitMono-400-Regular.otf', weight: '400', style: 'normal' },
    { path: '../fonts/CommitMono-700-Regular.otf', weight: '700', style: 'normal' },
    { path: '../fonts/CommitMono-400-Italic.otf',  weight: '400', style: 'italic' },
    { path: '../fonts/CommitMono-700-Italic.otf',  weight: '700', style: 'italic' },
  ],
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const { pageTitle, pageDescription } = appConfig;
  const styles = getStyles(appConfig);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(publicSans.variable, commitMono.variable, 'scroll-smooth font-sans antialiased')}
    >
      <head>
        {styles && <style>{styles}</style>}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <ApplyThemeScript />
      </head>
      <body className="overflow-x-hidden" style={{ backgroundColor: '#030303', color: '#f8fafc' }}>
        <Aurora
          colorStops={['#06b6d4', '#3b82f6', '#7c3aed']}
          amplitude={0.40}
          blend={1.00}
          speed={0.3}
          opacity={0.75}
        />
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
