// utils/documentGenerator.js
import {
    Document,
    Paragraph,
    TextRun,
    Packer,
    Table,
    TableRow,
    TableCell,
    WidthType,
} from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function formatDate(d) {
    try {
        return new Date(d).toLocaleDateString('es-AR', { timeZone: 'UTC' });
    } catch {
        return String(d ?? '');
    }
}

function money(n) {
    const v = Number(n || 0);
    return `$${v.toFixed(2)}`;
}

function getNombreProfesor(c) {
    return c.nombre_profesor || `${c.persona_apellido ?? ''} ${c.persona_nombre ?? ''}`.trim();
}

function materiasLabel(contrato) {
    if (Array.isArray(contrato.materias) && contrato.materias.length) {
        return contrato.materias
        .map((m) => m.descripcion_materia || m.nombre_materia || '')
        .filter(Boolean);
    }
    if (contrato.nombre_materia) return [contrato.nombre_materia];
    if (contrato.descripcion_materia) return [contrato.descripcion_materia];
    return [];
}


export async function generateWordDocument(contrato) {
    const nombreProfesor = getNombreProfesor(contrato);
    const materias = materiasLabel(contrato);
    const periodo = contrato.nombre_periodo || String(contrato.id_periodo ?? '');

    const doc = new Document({
        sections: [
        {
            properties: {},
            children: [
            new Paragraph({
                text: 'CONTRATO DE PRESTACIÓN DE SERVICIOS DOCENTES',
                heading: 'Heading1',
                spacing: { after: 200 },
            }),

            new Paragraph({
                text: `N° de Contrato: ${contrato.id_contrato_profesor ?? ''}`,
                spacing: { after: 100 },
            }),

            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                new TableRow({
                    children: [
                    new TableCell({
                        children: [new Paragraph('Profesor:')],
                        width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                        children: [new Paragraph(nombreProfesor || '')],
                    }),
                    ],
                }),
                new TableRow({
                    children: [
                    new TableCell({ children: [new Paragraph('Materia(s):')] }),
                    new TableCell({
                        children: [
                        new Paragraph(
                            materias.length ? materias.join(', ') : '—'
                        ),
                        ],
                    }),
                    ],
                }),
                new TableRow({
                    children: [
                    new TableCell({ children: [new Paragraph('Horas Semanales:')] }),
                    new TableCell({
                        children: [
                        new Paragraph(
                            contrato.horas_semanales != null
                            ? String(contrato.horas_semanales)
                            : ''
                        ),
                        ],
                    }),
                    ],
                }),
                new TableRow({
                    children: [
                    new TableCell({ children: [new Paragraph('Monto por Hora:')] }),
                    new TableCell({
                        children: [new Paragraph(money(contrato.monto_hora))],
                    }),
                    ],
                }),
                new TableRow({
                    children: [
                    new TableCell({ children: [new Paragraph('Período:')] }),
                    new TableCell({ children: [new Paragraph(periodo)] }),
                    ],
                }),
                new TableRow({
                    children: [
                    new TableCell({ children: [new Paragraph('Fecha inicio:')] }),
                    new TableCell({
                        children: [new Paragraph(formatDate(contrato.fecha_inicio))],
                    }),
                    ],
                }),
                new TableRow({
                    children: [
                    new TableCell({ children: [new Paragraph('Fecha fin:')] }),
                    new TableCell({
                        children: [new Paragraph(formatDate(contrato.fecha_fin))],
                    }),
                    ],
                }),
                ],
            }),

            new Paragraph({
                text: 'TÉRMINOS Y CONDICIONES:',
                heading: 'Heading2',
                spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
                text:
                '1. El presente contrato se rige por las normativas vigentes de la institución.',
                spacing: { after: 100 },
            }),
            new Paragraph({
                text:
                '2. El pago se realizará según lo establecido en el reglamento de docentes.',
                spacing: { after: 100 },
            }),
            new Paragraph({
                text:
                '3. Cualquier modificación al presente contrato deberá ser por escrito y firmada por ambas partes.',
                spacing: { after: 100 },
            }),

            new Paragraph({ text: 'Firma del Docente: ________________________', spacing: { before: 400 } }),
            new Paragraph({
                text: 'Firma del Representante: _________________',
                spacing: { before: 100, after: 100 },
            }),
            ],
        },
        ],
    });

    return await Packer.toBuffer(doc);
}

export async function generatePdfDocument(contrato) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 12;
    const lineH = 1.5;
    let y = height - 50;

    const drawText = (text, x, yPos, { bold = false, size = fontSize, color = rgb(0,0,0) } = {}) => {
        page.drawText(String(text ?? ''), {
        x, y: yPos, size, font: bold ? fontBold : fontRegular, color,
        });
        return yPos - size * lineH;
    };

    const wrapLines = (text, maxWidth, size = fontSize, font = fontRegular) => {
        const words = String(text ?? '').split(/\s+/);
        const lines = [];
        let line = '';
        for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        const wPx = font.widthOfTextAtSize(test, size);
        if (wPx <= maxWidth) {
            line = test;
        } else {
            if (line) lines.push(line);
            line = w; // palabra larga salta de línea
        }
        }
        if (line) lines.push(line);
        return lines;
    };

    const drawRowWrapped = (label, value, startY, valueX = 200, maxWidth = 350) => {
        let yAfter = drawText(label, 50, startY, { bold: true });
        const lines = wrapLines(value, maxWidth, fontSize, fontRegular);
        let yVal = startY;
        for (const ln of lines) yVal = drawText(ln, valueX, yVal);
        // bajar a la línea siguiente considerando el bloque más alto
        return Math.min(yAfter, yVal) - 6;
    };

    // Título
    y = drawText('CONTRATO DE PRESTACIÓN DE SERVICIOS DOCENTES', 50, y, { bold: true, size: 16 });
    y -= 12;
    y = drawText(`N° de Contrato: ${contrato.id_contrato_profesor ?? ''}`, 50, y, { bold: true });
    y -= 6;

    const nombreProfesor = getNombreProfesor(contrato);
    const materias = materiasLabel(contrato).join(', ') || '—';
    const periodo = contrato.nombre_periodo || String(contrato.id_periodo ?? '');
    const monto = money(contrato.monto_hora);

    y = drawRowWrapped('Profesor:', nombreProfesor, y);
    y = drawRowWrapped('Materia(s):', materias, y);          // <-- envuelve
    y = drawRowWrapped('Horas Semanales:', String(contrato.horas_semanales ?? ''), y);
    y = drawRowWrapped('Monto por Hora:', monto, y);
    y = drawRowWrapped('Período:', periodo, y);
    y = drawRowWrapped('Fecha inicio:', formatDate(contrato.fecha_inicio), y);
    y = drawRowWrapped('Fecha fin:', formatDate(contrato.fecha_fin), y);

    y -= 10;
    y = drawText('TÉRMINOS Y CONDICIONES:', 50, y, { bold: true });
    y = drawRowWrapped('', '1. El presente contrato se rige por las normativas vigentes de la institución.', y, 50, 500);
    y = drawRowWrapped('', '2. El pago se realizará según lo establecido en el reglamento de docentes.', y, 50, 500);
    y = drawRowWrapped('', '3. Cualquier modificación al presente contrato deberá ser por escrito y firmada por ambas partes.', y, 50, 500);

    y -= 28;
    y = drawText('Firma del Docente: ________________________', 50, y);
    y = drawText('Firma del Representante: _________________', 50, y);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}
