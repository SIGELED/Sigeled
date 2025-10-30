// utils/documentGenerator.js
import { Document, Paragraph, TextRun, Packer, Table, TableRow, TableCell, WidthType } from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generateWordDocument(contrato) {
    const doc = new Document({
        sections: [{
        properties: {},
        children: [
                new Paragraph({
                text: "CONTRATO DE PRESTACIÓN DE SERVICIOS DOCENTES",
                heading: "Heading1",
                spacing: { after: 200 },
            }),
                new Paragraph({
                text: `N° de Contrato: ${contrato.id_contrato_profesor}`,
                spacing: { after: 100 },
            }),
                new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                    new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph("Profesor:")], width: { size: 30, type: WidthType.PERCENTAGE } }),
                        new TableCell({ children: [new Paragraph(contrato.nombre_profesor || '')] }),
                ],
                }),
                    new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph("Materia:")] }),
                        new TableCell({ children: [new Paragraph(contrato.nombre_materia || '')] }),
                ],
                }),
                    new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph("Horas Semanales:")] }),
                        new TableCell({ children: [new Paragraph(contrato.horas_semanales?.toString() || '')] }),
                ],
                }),
                    new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph("Monto por Hora:")] }),
                        new TableCell({ children: [new Paragraph(`$${Number(contrato.monto_hora || 0).toFixed(2)}`)] }),
                ],
                }),
                    new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph("Período:")] }),
                        new TableCell({ children: [new Paragraph(contrato.nombre_periodo || '')] }),
                ],
                }),
            ],
            }),
                new Paragraph({
                text: "TÉRMINOS Y CONDICIONES:",
                heading: "Heading2",
                spacing: { before: 400, after: 200 },
            }),
                new Paragraph({
                text: "1. El presente contrato se rige por las normativas vigentes de la institución.",
                spacing: { after: 100 },
            }),
                new Paragraph({
                text: "2. El pago se realizará según lo establecido en el reglamento de docentes.",
                spacing: { after: 100 },
            }),
                new Paragraph({
                text: "3. Cualquier modificación al presente contrato deberá ser por escrito y firmada por ambas partes.",
                spacing: { after: 100 },
            }),
                new Paragraph({
                text: "Firma del Docente: ________________________",
                spacing: { before: 400 },
            }),
                new Paragraph({
                text: "Firma del Representante: _________________",
                spacing: { before: 100, after: 100 },
            }),
        ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
}

// Generate a PDF document
export async function generatePdfDocument(contrato) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const fontSize = 12;
    const lineHeight = 1.5;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;

    const drawText = (text, x, y, options = {}) => {
        const { font: textFont = font, size = fontSize, color = rgb(0, 0, 0), bold = false } = options;
        page.drawText(text, {
        x,
        y,
        size,
        font: textFont,
        color,
        });
        return y - (size * lineHeight);
    };

    y = drawText("CONTRATO DE PRESTACIÓN DE SERVICIOS DOCENTES", 50, y, { size: 16, bold: true });
    y -= 20;
    
    y = drawText(`N° de Contrato: ${contrato.id_contrato_profesor}`, 50, y, { bold: true });
    y -= 30;

    const drawTableRow = (label, value, yPos) => {
        let currentY = yPos;
        currentY = drawText(label, 50, currentY, { bold: true });
        currentY = drawText(value, 200, yPos);
        return currentY - 20;
    };


    y = drawTableRow("Profesor:", contrato.nombre_profesor || '', y);
    y = drawTableRow("Materia:", contrato.nombre_materia || '', y);
    y = drawTableRow("Horas Semanales:", contrato.horas_semanales?.toString() || '', y);
    y = drawTableRow("Monto por Hora:", `$${Number(contrato.monto_hora || 0).toFixed(2)}`, y);
    y = drawTableRow("Período:", contrato.nombre_periodo || '', y);

    y -= 30;
    y = drawText("TÉRMINOS Y CONDICIONES:", 50, y, { bold: true });
    y -= 20;
    y = drawText("1. El presente contrato se rige por las normativas vigentes de la institución.", 50, y);
    y = drawText("2. El pago se realizará según lo establecido en el reglamento de docentes.", 50, y);
    y = drawText("3. Cualquier modificación al presente contrato deberá ser por escrito y firmada por ambas partes.", 50, y);

    y -= 50;
    y = drawText("Firma del Docente: ________________________", 50, y);
    y = drawText("Firma del Representante: _________________", 50, y);

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}