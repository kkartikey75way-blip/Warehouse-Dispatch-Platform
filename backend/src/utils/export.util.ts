import { Response } from "express";


export const exportToCsv = (res: Response, filename: string, data: Record<string, string | number | boolean | null>[]) => {
    const firstRow = data[0];
    if (!firstRow) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send("");
        return;
    }

    const headers = Object.keys(firstRow);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const val = row[header];

                const stringVal = val === null || val === undefined ? "" : String(val);
                if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
                    return `"${stringVal.replace(/"/g, '""')}"`;
                }
                return stringVal;
            }).join(',')
        )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csvContent);
};
