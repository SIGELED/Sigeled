import {
    Document,
    Paragraph,
    TextRun,
    Packer,
    Table,
    TableRow,
    TableCell,
    WidthType,
} from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function formatDate(d) {
    try {
        return new Date(d).toLocaleDateString("es-AR", { timeZone: "UTC" });
    } catch {
        return String(d ?? "");
    }
}

function money(n) {
    const v = Number(n || 0);
    if (!Number.isFinite(v)) return "$0.00";
    return `$${v.toFixed(2)}`;
}

// Mantengo el nombre pero lo hago más general
function getNombreProfesor(c) {
    const nombreBase =
        c.nombre_profesor ||
        `${c.persona_apellido ?? ""} ${c.persona_nombre ?? ""}`.trim();

    if (nombreBase) return nombreBase;

    // Fallbacks por si más adelante usás otros nombres de campos
    if (c.nombre_persona) return c.nombre_persona;
    if (c.empleado_nombre) return c.empleado_nombre;

    return "";
}

// Versión original, sigue sirviendo como fallback
function materiasLabel(contrato) {
    if (Array.isArray(contrato.materias) && contrato.materias.length) {
        return contrato.materias
            .map((m) => {
                const base =
                    m.descripcion_materia || m.nombre_materia || "";
                if (!base) return "";
                const cargo = m.cargo ? ` (${m.cargo})` : "";
                return `${base}${cargo}`;
            })
            .filter(Boolean);
    }
    if (contrato.nombre_materia) return [contrato.nombre_materia];
    if (contrato.descripcion_materia) return [contrato.descripcion_materia];
    return [];
}

/**
 * Actividades / materias combinadas a partir del modelo nuevo (items)
 * o del viejo (materias).
 */
function actividadesLabel(contrato) {
    const items = Array.isArray(contrato.items) ? contrato.items : null;
    if (items && items.length) {
        return items
            .map((it) => {
                const esDocencia =
                    String(it.tipo_item || "").toUpperCase() === "DOCENCIA";

                const base = esDocencia
                    ? it.descripcion_materia ||
                      it.nombre_materia ||
                      it.descripcion_actividad ||
                      ""
                    : it.descripcion_actividad ||
                      it.descripcion_materia ||
                      it.nombre_materia ||
                      "";

                if (!base) return "";

                const cargo = it.codigo_cargo || it.cargo || "";
                const perfil =
                    it.perfil_codigo ||
                    it.perfil_nombre ||
                    it.perfil ||
                    "";

                const cargoPart = cargo ? ` (${cargo})` : "";
                const perfilPart = perfil ? ` - ${perfil}` : "";

                return `${base}${cargoPart}${perfilPart}`;
            })
            .filter(Boolean);
    }

    // Si todavía no usás items, sigue funcionando como antes
    return materiasLabel(contrato);
}

/**
 * Devuelve un arreglo normalizado de actividades para armar la tabla de detalle.
 * Si hay contrato.items (modelo general), se usa eso.
 * Si no, cae al viejo contrato.materias.
 */
function getDetalleActividades(contrato) {
    const items = Array.isArray(contrato.items) ? contrato.items : null;
    if (items && items.length) {
        return items.map((it) => {
            const esDocencia =
                String(it.tipo_item || "").toUpperCase() === "DOCENCIA";

            const descripcion = esDocencia
                ? it.descripcion_materia ||
                  it.nombre_materia ||
                  it.descripcion_actividad ||
                  ""
                : it.descripcion_actividad ||
                  it.descripcion_materia ||
                  it.nombre_materia ||
                  "";

            return {
                tipo_item: it.tipo_item || "",
                descripcion,
                cargo: it.codigo_cargo || it.cargo || "",
                horas_semanales: it.horas_semanales,
                monto_hora: it.monto_hora,
                subtotal_mensual: it.subtotal_mensual,
                perfil:
                    it.perfil_codigo ||
                    it.perfil_nombre ||
                    it.perfil ||
                    "",
            };
        });
    }

    // Fallback: modo viejo usando contrato.materias
    const materiasDetalle = Array.isArray(contrato.materias)
        ? contrato.materias
        : [];

    return materiasDetalle.map((m) => ({
        tipo_item: "DOCENCIA",
        descripcion: m.descripcion_materia || m.nombre_materia || "",
        cargo: m.cargo || "",
        horas_semanales: m.horas_semanales,
        monto_hora: m.monto_hora,
        subtotal_mensual: null, // se calcula como antes (hs * 4 * monto)
        perfil: "",
    }));
}

export async function generateWordDocument(contrato) {
    const nombreProfesor = getNombreProfesor(contrato);
    const actividades = actividadesLabel(contrato);
    const periodo =
        contrato.nombre_periodo || String(contrato.id_periodo ?? "");

    const detalleActividades = getDetalleActividades(contrato);

    const totalHorasSem =
        contrato.horas_semanales != null
            ? contrato.horas_semanales
            : detalleActividades.reduce(
                  (acc, m) => acc + (Number(m.horas_semanales) || 0),
                  0
              );

    const detalleRows = detalleActividades.length
        ? [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph("Actividad / Materia"),
                            ],
                        }),
                        new TableCell({
                            children: [new Paragraph("Perfil")],
                        }),
                        new TableCell({
                            children: [new Paragraph("Rol")],
                        }),
                        new TableCell({
                            children: [
                                new Paragraph("Horas semanales"),
                            ],
                        }),
                        new TableCell({
                            children: [
                                new Paragraph("Monto por hora"),
                            ],
                        }),
                        new TableCell({
                            children: [
                                new Paragraph("Subtotal mensual"),
                            ],
                        }),
                    ],
                }),
                ...detalleActividades.map((m) => {
                    const hs = Number(m.horas_semanales) || 0;
                    const mh = Number(m.monto_hora) || 0;
                    const subtotal =
                        m.subtotal_mensual != null
                            ? Number(m.subtotal_mensual)
                            : hs && mh
                            ? hs * 4 * mh
                            : null;

                    return new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph(m.descripcion || "")],
                            }),
                            new TableCell({
                                children: [new Paragraph(m.perfil || "")],
                            }),
                            new TableCell({
                                children: [new Paragraph(m.cargo || "")],
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph(
                                        hs ? String(hs) : ""
                                    ),
                                ],
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph(
                                        mh ? money(mh) : ""
                                    ),
                                ],
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph(
                                        subtotal != null
                                            ? money(subtotal)
                                            : ""
                                    ),
                                ],
                            }),
                        ],
                    });
                }),
            ]
        : [];

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        text: "CONTRATO DE PRESTACIÓN DE SERVICIOS DOCENTES",
                        heading: "Heading1",
                        spacing: { after: 200 },
                    }),

                    new Paragraph({
                        text: `N° de Contrato: ${
                            contrato.id_contrato_profesor ?? ""
                        }`,
                        spacing: { after: 100 },
                    }),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph(
                                                "Profesor:"
                                            ),
                                        ],
                                        width: {
                                            size: 30,
                                            type: WidthType.PERCENTAGE,
                                        },
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph(
                                                nombreProfesor || ""
                                            ),
                                        ],
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph(
                                                "Actividades / Materias:"
                                            ),
                                        ],
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph(
                                                actividades.length
                                                    ? actividades.join(", ")
                                                    : "—"
                                            ),
                                        ],
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph(
                                                "Horas Semanales (total):"
                                            ),
                                        ],
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph(
                                                totalHorasSem != null
                                                    ? String(
                                                        totalHorasSem
                                                    )
                                                : ""
                                            ),
                                        ],
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph(
                                                "Monto por Hora (promedio):"
                                            ),
                                        ],
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph(
                                                money(
                                                    contrato.monto_hora
                                                )
                                            ),
                                        ],
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph("Período:"),
                                        ],
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph(periodo),
                                        ],
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph(
                                                "Fecha inicio:"
                                            ),
                                        ],
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph(
                                                formatDate(
                                                    contrato.fecha_inicio
                                                )
                                            ),
                                        ],
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph("Fecha fin:"),
                                        ],
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph(
                                                formatDate(
                                                    contrato.fecha_fin
                                                )
                                            ),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),

                    ...(detalleRows.length
                        ? [
                            new Paragraph({
                                text: "Detalle por actividad y rol",
                                heading: "Heading2",
                                spacing: {
                                    before: 300,
                                    after: 100,
                                },
                            }),
                            new Table({
                                width: {
                                    size: 100,
                                    type: WidthType.PERCENTAGE,
                                },
                                rows: detalleRows,
                            }),
                        ]
                        : []),

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

    const drawText = (
        text,
        x,
        yPos,
        { bold = false, size = fontSize, color = rgb(0, 0, 0) } = {}
    ) => {
        page.drawText(String(text ?? ""), {
            x,
            y: yPos,
            size,
            font: bold ? fontBold : fontRegular,
            color,
        });
        return yPos - size * lineH;
    };

    const wrapLines = (text, maxWidth, size = fontSize, font = fontRegular) => {
        const words = String(text ?? "").split(/\s+/);
        const lines = [];
        let line = "";
        for (const w of words) {
            const test = line ? `${line} ${w}` : w;
            const wPx = font.widthOfTextAtSize(test, size);
            if (wPx <= maxWidth) {
                line = test;
            } else {
                if (line) lines.push(line);
                line = w;
            }
        }
        if (line) lines.push(line);
        return lines;
    };

    const drawRowWrapped = (
        label,
        value,
        startY,
        valueX = 200,
        maxWidth = 350
    ) => {
        let yAfter = startY;
        if (label) {
            yAfter = drawText(label, 50, startY, { bold: true });
        }
        const lines = wrapLines(value, maxWidth, fontSize, fontRegular);
        let yVal = startY;
        for (const ln of lines) yVal = drawText(ln, valueX, yVal);
        return Math.min(yAfter, yVal) - 6;
    };

    y = drawText(
        "CONTRATO DE PRESTACIÓN DE SERVICIOS DOCENTES",
        50,
        y,
        { bold: true, size: 16 }
    );
    y -= 12;
    y = drawText(
        `N° de Contrato: ${contrato.id_contrato_profesor ?? ""}`,
        50,
        y,
        { bold: true }
    );
    y -= 6;

    const nombreProfesor = getNombreProfesor(contrato);
    const actividadesStr =
        actividadesLabel(contrato).join(", ") || "—";
    const periodo =
        contrato.nombre_periodo || String(contrato.id_periodo ?? "");
    const monto = money(contrato.monto_hora);

    const detalleActividades = getDetalleActividades(contrato);
    const totalHorasSem =
        contrato.horas_semanales != null
            ? contrato.horas_semanales
            : detalleActividades.reduce(
                (acc, m) =>
                    acc + (Number(m.horas_semanales) || 0),
                0
            );

    y = drawRowWrapped("Profesor:", nombreProfesor, y);
    y = drawRowWrapped(
        "Actividades / Materias:",
        actividadesStr,
        y
    );
    y = drawRowWrapped(
        "Horas Semanales (total):",
        String(totalHorasSem ?? ""),
        y
    );
    y = drawRowWrapped("Monto por Hora (promedio):", monto, y);
    y = drawRowWrapped("Período:", periodo, y);
    y = drawRowWrapped(
        "Fecha inicio:",
        formatDate(contrato.fecha_inicio),
        y
    );
    y = drawRowWrapped(
        "Fecha fin:",
        formatDate(contrato.fecha_fin),
        y
    );

    if (detalleActividades.length) {
        y -= 8;
        y = drawText("Detalle por actividad y rol:", 50, y, {
            bold: true,
        });

        detalleActividades.forEach((m) => {
            const hs = Number(m.horas_semanales) || 0;
            const mh = Number(m.monto_hora) || 0;
            const subtotal =
                m.subtotal_mensual != null
                    ? Number(m.subtotal_mensual)
                    : hs && mh
                    ? hs * 4 * mh
                    : null;

            const partes = [];

            if (m.descripcion) partes.push(m.descripcion);
            if (m.perfil) partes.push(`Perfil: ${m.perfil}`);
            if (m.cargo) partes.push(`Rol: ${m.cargo}`);
            if (hs) partes.push(`${hs} hs/sem`);
            if (mh) partes.push(`${money(mh)} por hora`);
            if (subtotal != null)
                partes.push(
                    `Subtotal mensual: ${money(subtotal)}`
                );

            const linea = partes.join(" - ");

            const lines = wrapLines(
                linea,
                500,
                fontSize,
                fontRegular
            );
            lines.forEach((ln) => {
                y = drawText(ln, 60, y);
            });
            y -= 4;
        });
    }

    y -= 10;
    y = drawText("TÉRMINOS Y CONDICIONES:", 50, y, { bold: true });
    y = drawRowWrapped(
        "",
        "1. El presente contrato se rige por las normativas vigentes de la institución.",
        y,
        50,
        500
    );
    y = drawRowWrapped(
        "",
        "2. El pago se realizará según lo establecido en el reglamento de docentes.",
        y,
        50,
        500
    );
    y = drawRowWrapped(
        "",
        "3. Cualquier modificación al presente contrato deberá ser por escrito y firmada por ambas partes.",
        y,
        50,
        500
    );

    y -= 28;
    y = drawText(
        "Firma del Docente: ________________________",
        50,
        y
    );
    y = drawText(
        "Firma del Representante: _________________",
        50,
        y
    );

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}
