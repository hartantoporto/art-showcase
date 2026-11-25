import { NextResponse } from 'next/server';
// Early UX redirect only; every sensitive query/mutation rechecks DB session, role and ownership.
export function proxy(request) {
    const { pathname } = request.nextUrl;
    const protectedArea = ['/member', '/curator', '/admin'];
    if (protectedArea.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))) {
        if (!request.cookies.get('spektra_session')?.value) {
            const url = new URL('/login', request.url);
            url.searchParams.set('next', pathname);
            return NextResponse.redirect(url);
        }
    }
    return NextResponse.next();
}
export const config = { matcher: ['/member/:path*', '/curator/:path*', '/admin/:path*'] };

