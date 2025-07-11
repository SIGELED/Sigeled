import PDFDocument from "pdfkit";
import pool from "../models/db.js";

// GET /api/contratos/:id/pdf
export async function generarPDFContrato(req, res) {
  try {
    const numero_contrato = req.params.id;
    // Traer datos del contrato, empleado y cátedras
    const contratoQuery = await pool.query(
      `SELECT c.*, e.nombre AS empleado_nombre, e.dni AS empleado_documento
       FROM contratos c
       JOIN empleados e ON c.empleado_id = e.id_empleado
       WHERE c.numero_contrato = $1`,
      [numero_contrato]
    );
    if (contratoQuery.rows.length === 0) {
      return res.status(404).json({ error: "Contrato no encontrado" });
    }
    const contrato = contratoQuery.rows[0];

    const catedrasQuery = await pool.query(
      `SELECT ca.nombre
         FROM contrato_catedras cc
         JOIN catedras ca ON cc.catedra_id = ca.id_catedra
         WHERE cc.contrato_id = $1`,
      [numero_contrato]
    );
    const catedras = catedrasQuery.rows.map(r => r.nombre);

    // Crear PDF profesional
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=contrato_${numero_contrato}.pdf`);
    doc.pipe(res);

    // Logo institucional (opcional)
    try {
      doc.image('./assets/logo.png', 50, 30, { width: 90 });
    } catch (e) { /* Si no hay logo, continuar */ }

    // Encabezado profesional
    doc
      .fillColor('#003366')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('SIGELED - Contrato de Docencia', 0, 40, { align: 'center' });
    doc.moveDown(2);
    doc
      .fillColor('black')
      .fontSize(12)
      .font('Helvetica');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#003366');
    doc.moveDown(1.5);

    // Datos principales
    // Datos principales centrados
    const datosX = 120; // margen izquierdo para centrar
    const anchoDatos = 370;
    doc.fontSize(12).font('Helvetica-Bold').text(`Número de contrato: `, datosX, undefined, { continued: true, width: anchoDatos }).font('Helvetica').text(contrato.numero_contrato);
    doc.font('Helvetica-Bold').text(`Empleado: `, datosX, undefined, { continued: true, width: anchoDatos }).font('Helvetica').text(`${contrato.empleado_nombre} (DNI: ${contrato.empleado_documento})`);
    doc.font('Helvetica-Bold').text(`Periodo: `, datosX, undefined, { continued: true, width: anchoDatos }).font('Helvetica').text(contrato.periodo);
    doc.font('Helvetica-Bold').text(`Estado: `, datosX, undefined, { continued: true, width: anchoDatos }).font('Helvetica').text(contrato.estado);
    doc.font('Helvetica-Bold').text(`Fecha de expedición: `, datosX, undefined, { continued: true, width: anchoDatos }).font('Helvetica').text(new Date(contrato.fecha_expedicion).toLocaleDateString());
    doc.font('Helvetica-Bold').text(`Fecha de vencimiento: `, datosX, undefined, { continued: true, width: anchoDatos }).font('Helvetica').text(new Date(contrato.fecha_vencimiento).toLocaleDateString());
    doc.moveDown();

    // Línea divisoria
    doc.moveTo(120, doc.y).lineTo(490, doc.y).stroke('#003366');
    doc.moveDown();

    // Tabla de cátedras centrada
    doc.font('Helvetica-Bold').fontSize(13).text('Cátedras asignadas:', datosX, undefined, { underline: true, width: anchoDatos });
    doc.moveDown(0.5);
    catedras.forEach((cat, i) => {
      doc.font('Helvetica').fontSize(12).text(`   • ${cat}`, datosX + 15, undefined, { width: anchoDatos - 15 });
    });
    doc.moveDown(1.5);

    // Espacio para condiciones y cláusulas (placeholder, centrado)
    doc.font('Helvetica-Bold').text('Condiciones y cláusulas:', datosX, undefined, { underline: true, width: anchoDatos });
    doc.font('Helvetica').fontSize(11).text('Las condiciones específicas del contrato se encuentran registradas en el sistema SIGELED y son de cumplimiento obligatorio para ambas partes.', datosX, undefined, { align: 'justify', width: anchoDatos });
    doc.moveDown(2);

    // Espacio para firmas
    doc.font('Helvetica').fontSize(12).text('_________________________', 70);
    doc.text('Firma del docente', 90);
    doc.moveDown(2);

    // Pie de página profesional
    doc.fontSize(8).fillColor('gray')
      .text('Documento generado automáticamente por SIGELED - Sistema de Gestión de Legajos Docentes', 50, doc.page.height - 50, { align: 'center', width: 500 });
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error al generar PDF" });
  }
}
