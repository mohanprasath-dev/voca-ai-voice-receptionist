import { Public_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { ApplyThemeScript, ThemeToggle } from '@/components/app/theme-toggle';
import { cn, getAppConfig, getStyles } from '@/lib/utils';
import '@/styles/globals.css';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

const commitMono = localFont({
  display: 'swap',
  variable: '--font-commit-mono',
  src: [
    {
      path: '../fonts/CommitMono-400-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-700-Regular.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-400-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/CommitMono-700-Italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
});

import { Aurora } from '@/components/reactbits/Aurora';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const { pageTitle, pageDescription } = appConfig;
  const styles = getStyles(appConfig);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        publicSans.variable,
        commitMono.variable,
        'scroll-smooth font-sans antialiased'
      )}
    >
      <head>
        {styles && <style>{styles}</style>}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <ApplyThemeScript />
      </head>
      <body className="overflow-x-hidden bg-[#030303]">
        <div className="relative min-h-screen">
          <Aurora className="absolute inset-0 -z-10" />
          <main className="relative z-10 flex flex-col min-h-screen">
            {children}
          </main>
          
          <div className="group fixed top-24 right-4 z-[200]">
            <ThemeToggle className="transition-all duration-300 md:translate-x-12 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100" />
            <div className="absolute top-0 right-0 hidden h-10 w-2 cursor-pointer rounded-full border border-white/10 bg-white/5 backdrop-blur-sm md:block" />
          </div>
        </div>
      </body>
    </html>
  );
}
