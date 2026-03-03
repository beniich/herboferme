import DebugWidget from '@/components/DebugWidget';
import { MiniMcLarenLoader } from '@/components/mini-mclarenloader';
import { NotificationToast } from '@/components/NotificationToast';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/providers/AuthProvider';
import { CallProvider } from '@/providers/CallProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import '@/styles/globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Sora } from 'next/font/google';
import { notFound } from 'next/navigation';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter'
});

const sora = Sora({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-sora'
});

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as "en" | "fr")) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale} className="light" suppressHydrationWarning>
            <head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
                />
            </head>
            <body className={`${inter.variable} ${sora.variable} font-sans antialiased text-slate-900 dark:text-slate-100 bg-white dark:bg-[#020617]`}>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
                        <QueryProvider>
                            <AuthProvider>
                                <CallProvider>
                                    {children}
                                    <NotificationToast />
                                    <DebugWidget />
                                    <MiniMcLarenLoader />
                                </CallProvider>
                            </AuthProvider>
                        </QueryProvider>
                    </GoogleOAuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
