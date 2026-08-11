import dayjs from 'dayjs';
import {
    Activity,
    FilePlus2,
    Trash2,
    LogIn,
    Globe,
    Monitor,
    Mail,
    Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

type ActivityLog = {
    id: number;
    action: 'create' | 'update' | 'delete' | 'login';
    description: string;
    email: string;
    ip_address: string | null;
    browser: string | null;
    created_at: string;
    user?: {
        name: string;
        email: string;
    } | null;
};

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    log: ActivityLog | null;
};

const actionStyles: Record<string, string> = {
    create: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    update: 'bg-blue-100 text-blue-700 border-blue-200',
    delete: 'bg-red-100 text-red-700 border-red-200',
    login: 'bg-purple-100 text-purple-700 border-purple-200',
};

const actionIcons: Record<string, any> = {
    create: FilePlus2,
    update: Activity,
    delete: Trash2,
    login: LogIn,
};

export default function ActivityLogDetailsDialog({
    open,
    setOpen,
    log,
}: Props) {
    if (!log) {
        return null;
    }

    const ActionIcon = actionIcons[log.action] ?? Activity;

    const rows = [
        {
            label: 'Description',
            value: log.description,
            icon: Activity,
        },
        {
            label: 'Email',
            value: log.email,
            icon: Mail,
        },
        {
            label: 'IP Address',
            value: log.ip_address ?? '—',
            icon: Globe,
        },
        {
            label: 'Browser',
            value: log.browser ?? '—',
            icon: Monitor,
        },
        {
            label: 'Logged At',
            value: dayjs(log.created_at).format('MMM D, YYYY hh:mm:ss A'),
            icon: Clock,
        },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <ActionIcon className="size-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>
                                {log.user?.name ?? 'Unknown User'}
                            </DialogTitle>
                            <DialogDescription>
                                Activity log #{log.id}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                        Action
                    </span>
                    <Badge
                        variant="outline"
                        className={
                            actionStyles[log.action] ??
                            'border-gray-200 bg-gray-100 text-gray-700'
                        }
                    >
                        <ActionIcon className="size-3.5" />{' '}
                        {log.action.charAt(0).toUpperCase() +
                            log.action.slice(1)}
                    </Badge>
                </div>

                <Separator />

                <div className="flex flex-col gap-3">
                    {rows.map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="flex items-start justify-between gap-4"
                        >
                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Icon className="size-3.5" />
                                {label}
                            </span>
                            <span className="text-right text-sm font-medium break-all">
                                {value}
                            </span>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
