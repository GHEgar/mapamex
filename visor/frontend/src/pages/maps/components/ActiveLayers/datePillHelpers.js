import { describeDateFilter, formatLoopLabel, formatLoopLabelLong } from '@pages/maps/helpers/dateLoopHelpers';

const LABEL_WIDTHS = {
    'year': { normal: 'w-[40px]', withPlay: 'w-[54px]' },
    'month-year': { normal: 'w-[72px]', withPlay: 'w-[86px]' },
    'multi-year': { normal: 'w-[50px]', withPlay: 'w-[64px]' },
    'multi-month': { normal: 'w-[100px]', withPlay: 'w-[114px]' },
};

export const getLabelWidthClass = (kind, withPlay = false) => {
    const entry = LABEL_WIDTHS[kind];
    if (!entry) return withPlay ? 'min-w-[62px]' : 'min-w-[48px]';
    return withPlay ? entry.withPlay : entry.normal;
};

export const SLOT_PILL = {
    A: { bg: 'bg-primary-soft', border: 'border-primary', text: 'text-primary', hover: 'hover:bg-primary/15' },
    B: { bg: 'bg-secondary-soft', border: 'border-secondary', text: 'text-secondary', hover: 'hover:bg-secondary/20' },
    none: { bg: 'bg-white', border: 'border-slate-200', text: 'text-graphite', hover: 'hover:border-primary hover:text-primary-deep' },
};

export const computeLabel = (filter, rasterPeriodicity) => {
    const desc = describeDateFilter({ filter, rasterPeriodicity });
    const label = formatLoopLabel(desc);
    let kind = null;
    if (desc) {
        if (desc.multi) kind = 'multi-year';
        else if (desc.annual || !desc.months?.length) kind = 'year';
        else if (desc.months.length === 1) kind = 'month-year';
        else kind = 'multi-month';
    }
    return { label, kind };
};

export const computeLabelLong = (filter, rasterPeriodicity) => {
    const desc = describeDateFilter({ filter, rasterPeriodicity });
    return { label: formatLoopLabelLong(desc) };
};
