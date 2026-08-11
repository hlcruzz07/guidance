import { Card, CardContent } from '@/components/ui/card';

export default function TableLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Card>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
