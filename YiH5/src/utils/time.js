const pad2 = (n) => String(n).padStart(2, '0');

export const formatHHMM = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

export const formatMDHM = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

export const toISODate = (date) => {
    if (date == null) return '';
    if (date instanceof Date) return date.toISOString().slice(0, 10);
    return new Date(date).toISOString().slice(0, 10);
};

export const shiftISODate = (isoStr, deltaDays) => {
    const base = isoStr ? new Date(isoStr) : new Date();
    base.setDate(base.getDate() + Number(deltaDays) || 0);
    return base.toISOString().slice(0, 10);
};
