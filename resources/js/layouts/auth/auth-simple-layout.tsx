export default function AuthSimpleLayout({
    title,
    description,
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-6 p-6">
                {(title || description) && (
                    <div className="text-center">
                        {title && (
                            <h1 className="text-2xl font-bold">{title}</h1>
                        )}
                        {description && (
                            <p className="text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
