import { headers } from 'next/headers';

export default async function MainContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
} 