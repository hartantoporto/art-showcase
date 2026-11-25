import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { currentUser } from '@/lib/auth';
export const metadata = {
    title: { default: 'SPEKTRA — The Grand Art Circus', template: '%s | SPEKTRA' },
    description: 'The Grand Art Circus: discover global art, explore creative galleries, play art puzzles, join challenges, and share your work.',
};
export default async function RootLayout({ children }) {
    const user = await currentUser();
    return (<html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
      </head>
      <body><SiteHeader user={user}/>{children}<SiteFooter /></body>
    </html>);
}

