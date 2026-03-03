import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Routes publiques (accessibles sans   tre connect  )
const publicRoutes = ['/login', '/register', '/forgot-password', '/'];

// D  code le payload JWT sans v  rification de signature (edge runtime safe)
function parseJwtPayload(token: string): Record<string, any> | null {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Extraire la locale depuis l'URL
    const pathLocale = pathname.split('/')[1];
    const locale = ['fr', 'en'].includes(pathLocale) ? pathLocale : 'en';

    // Chemin sans locale pour la comparaison
    const pathWithoutLocale = pathname.replace(/^\/(fr|en)/, '') || '/';

    const isPublicRoute = publicRoutes.some(route =>
        pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/')
    );

    //     On lit le cookie HttpOnly `access_token` pos   par le backend Herbute
    const accessToken = request.cookies.get('access_token')?.value;
    const isAuthenticated = !!accessToken;

    // Route prot  g  e sans token     login
    if (!isPublicRoute && !isAuthenticated) {
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set('from', pathname); // Garder la destination
        return NextResponse.redirect(loginUrl);
    }

    // D  j   connect   et tente d'acc  der    /login     dashboard
    if (isPublicRoute && isAuthenticated && pathWithoutLocale === '/login') {
        const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    // RBAC : V  rification des routes admin
    if (isAuthenticated && pathWithoutLocale.startsWith('/admin')) {
        const payload = parseJwtPayload(accessToken!);
        const isAdmin = payload?.role === 'admin' || payload?.role === 'super_admin';
        if (!isAdmin) {
            return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
        }
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: [
        '/((?!api|_next|_vercel|.*\\..*).*)',
        '/',
        '/(fr|en)/:path*'
    ]
};
