import { LICENCIA_URL, LICENCIA_TEXTO } from '@constants/app';

const LicenseTooltipContent = () => (
    <span className="text-[11px]/[15px]">
        {LICENCIA_TEXTO}{' '}
        <a
            href={LICENCIA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
        >
            Licencia MapaMex 2026
        </a>
    </span>
);

export default LicenseTooltipContent;
