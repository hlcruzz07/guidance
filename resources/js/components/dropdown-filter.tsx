import type { LucideIcon } from 'lucide-react';
import { ChevronDownIcon } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

type DropdownFilterProps = {
    label: string;
    filterKey: string;
    options: string[];
    value: string | null;
    onSelect: (key: string, value: string | null) => void;
    icon?: LucideIcon;
    disabled?: boolean;
};

export default function DropdownFilter({
    label,
    filterKey,
    options,
    value,
    onSelect,
    icon: Icon,
    disabled,
}: DropdownFilterProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="rounded-full"
                    disabled={disabled}
                >
                    {Icon && <Icon />}
                    {label}
                    {value && <Badge>{value}</Badge>}
                    <ChevronDownIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {options.map((item) => (
                    <DropdownMenuCheckboxItem
                        key={item}
                        checked={value === item}
                        onSelect={() => {
                            onSelect(filterKey, value === item ? null : item);
                        }}
                    >
                        {item}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
