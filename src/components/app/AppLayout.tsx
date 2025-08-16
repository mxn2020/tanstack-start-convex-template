import { useLocation } from '@tanstack/react-router';
import { Header } from './Header';

interface Props {
    children: React.ReactNode;
}

export function AppLayout({ children }: Props) {
    const location = useLocation();
    const isAuthRoute = location.pathname.startsWith('/auth/');

    return (
        <div className="min-h-screen bg-gray-50">
            {!isAuthRoute && <Header />}
            <main>
                {children}
            </main>
        </div>
    );
}