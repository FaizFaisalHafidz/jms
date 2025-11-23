import { LucideIcon } from 'lucide-react';

export default function Heading({
    title,
    description,
    icon: Icon,
}: {
    title: string;
    description?: string;
    icon?: LucideIcon;
}) {
    return (
        <div className="mb-8 space-y-0.5">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="h-6 w-6" />}
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
    );
}

export { Heading };
