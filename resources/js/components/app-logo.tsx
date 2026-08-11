import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { normalizeName } from '@/lib/utils';

export default function AppLogo() {
    return (
        <>
            <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">
                    GUIDANCE OFFICE
                </span>
                <small>
                    {normalizeName(usePage().props.auth.user.roles[0].name)}
                </small>
            </div>
        </>
    );
}
