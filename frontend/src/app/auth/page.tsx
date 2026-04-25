'use client';

import { Suspense } from 'react';
import AuthPage from '@/components/AuthPage';

function AuthFallback() {
    return (
        <div className="auth-page">
            <div className="pulse" style={{ fontSize: '2rem', fontWeight: 900 }}>
                Réserve-vite
            </div>
        </div>
    );
}

export default function AuthRoute() {
    return (
        <Suspense fallback={<AuthFallback />}>
            <AuthPage />
        </Suspense>
    );
}
