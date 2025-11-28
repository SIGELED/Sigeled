import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Formatea una fecha a formato DD/MM/YYYY
 */
function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    try {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-AR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            timeZone: 'UTC'
        });
    } catch {
        return 'N/A';
    }
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return 'N/A';
    try {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    } catch {
        return 'N/A';
    }
}

/**
 * Genera el PDF del informe escalafonario
 */
export async function generateInformeEscalafonarioPDF(informe) {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    // Configuración de página
    const pageWidth = 595.28; // A4
    const pageHeight = 841.89;
    const margin = 50;
    const contentWidth = pageWidth - (margin * 2);

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;

    // Función auxiliar para agregar texto
    const addText = (text, options = {}) => {
        const {
            size = 12,
            font = timesRomanFont,
            color = rgb(0, 0, 0),
            bold = false,
            indent = 0
        } = options;

        const actualFont = bold ? timesRomanBold : font;

        // Si no hay espacio, agregar nueva página
        if (yPosition < margin + 50) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
        }

        page.drawText(text, {
            x: margin + indent,
            y: yPosition,
            size,
            font: actualFont,
            color
        });

        yPosition -= size + 5;
    };

    // Función para agregar línea separadora
    const addLine = () => {
        page.drawLine({
            start: { x: margin, y: yPosition },
            end: { x: pageWidth - margin, y: yPosition },
            thickness: 0.5,
            color: rgb(0.5, 0.5, 0.5)
        });
        yPosition -= 15;
    };

    // ===== ENCABEZADO =====
    addText('INFORME ESCALAFONARIO', { size: 18, bold: true });
    addText(`Generado el: ${formatearFecha(new Date())}`, { size: 10 });
    yPosition -= 10;
    addLine();

    // ===== DATOS PERSONALES =====
    addText('DATOS PERSONALES', { size: 14, bold: true });
    yPosition -= 5;

    addText(`Apellido y Nombre: ${informe.apellido || ''} ${informe.nombre || ''}`, { size: 11 });
    addText(`DNI: ${informe.dni || 'N/A'}`, { size: 11 });
    addText(`Fecha de Nacimiento: ${formatearFecha(informe.fecha_nacimiento)} (${calcularEdad(informe.fecha_nacimiento)} años)`, { size: 11 });
    addText(`Sexo: ${informe.sexo || 'N/A'}`, { size: 11 });
    
    if (informe.email) {
        addText(`Email: ${informe.email}`, { size: 11 });
    }
    
    if (informe.telefono) {
        addText(`Teléfono: ${informe.telefono}`, { size: 11 });
    }

    // Domicilio
    if (informe.calle || informe.localidad) {
        let domicilio = [];
        if (informe.calle) domicilio.push(informe.calle);
        if (informe.numero) domicilio.push(informe.numero);
        if (informe.piso) domicilio.push(`Piso ${informe.piso}`);
        if (informe.depto) domicilio.push(`Depto ${informe.depto}`);
        
        addText(`Domicilio: ${domicilio.join(' ')}`, { size: 11 });
        
        if (informe.localidad) {
            let localidadCompleta = informe.localidad;
            if (informe.provincia) localidadCompleta += `, ${informe.provincia}`;
            if (informe.codigo_postal) localidadCompleta += ` (CP: ${informe.codigo_postal})`;
            addText(`Localidad: ${localidadCompleta}`, { size: 11 });
        }
    }

    yPosition -= 10;
    addLine();

    // ===== PERFILES =====
    if (informe.perfiles && informe.perfiles.length > 0) {
        addText('PERFILES', { size: 14, bold: true });
        yPosition -= 5;
        informe.perfiles.forEach(perfil => {
            addText(`• ${perfil.perfil}`, { size: 11, indent: 10 });
        });
        yPosition -= 10;
        addLine();
    }

    // ===== ANTIGÜEDAD =====
    addText('ANTIGÜEDAD', { size: 14, bold: true });
    yPosition -= 5;

    if (informe.fecha_primer_contrato) {
        addText(`Fecha de primer contrato: ${formatearFecha(informe.fecha_primer_contrato)}`, { size: 11 });
        addText(`Antigüedad: ${informe.antiguedad_anios || 0} años y ${informe.antiguedad_meses || 0} meses`, { size: 11, bold: true });
    } else {
        addText('Sin contratos registrados', { size: 11 });
    }

    addText(`Total de contratos: ${informe.total_contratos || 0}`, { size: 11 });
    addText(`Contratos activos: ${informe.contratos_activos || 0}`, { size: 11 });

    yPosition -= 10;
    addLine();

    // ===== TÍTULOS ACADÉMICOS =====
    addText('TÍTULOS ACADÉMICOS', { size: 14, bold: true });
    yPosition -= 5;

    const titulos = informe.titulos || [];
    if (titulos.length > 0) {
        titulos.forEach((titulo, index) => {
            if (yPosition < margin + 100) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                yPosition = pageHeight - margin;
            }

            addText(`${index + 1}. ${titulo.nombre_titulo || 'Sin nombre'}`, { size: 11, bold: true });
            addText(`   Tipo: ${titulo.tipo_titulo || 'N/A'}`, { size: 10, indent: 15 });
            
            if (titulo.institucion) {
                addText(`   Institución: ${titulo.institucion}`, { size: 10, indent: 15 });
            }
            
            if (titulo.fecha_emision) {
                addText(`   Fecha de emisión: ${formatearFecha(titulo.fecha_emision)}`, { size: 10, indent: 15 });
            }
            
            if (titulo.matricula_prof) {
                addText(`   Matrícula: ${titulo.matricula_prof}`, { size: 10, indent: 15 });
            }
            
            addText(`   Estado: ${titulo.estado_verificacion || 'Sin verificar'}`, { 
                size: 10, 
                indent: 15,
                color: titulo.estado_verificacion === 'Aprobado' ? rgb(0, 0.5, 0) : rgb(0, 0, 0)
            });

            yPosition -= 5;
        });
    } else {
        addText('Sin títulos registrados', { size: 11 });
    }

    yPosition -= 10;
    addLine();

    // ===== HISTORIAL DE CONTRATOS =====
    addText('HISTORIAL DE CONTRATOS', { size: 14, bold: true });
    yPosition -= 5;

    const contratos = informe.contratos || [];
    if (contratos.length > 0) {
        contratos.forEach((contrato, index) => {
            if (yPosition < margin + 120) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                yPosition = pageHeight - margin;
            }

            const fechaInicio = formatearFecha(contrato.fecha_inicio);
            const fechaFin = contrato.fecha_fin ? formatearFecha(contrato.fecha_fin) : 'Actualidad';
            
            addText(`${index + 1}. Período: ${contrato.periodo || 'N/A'} ${contrato.anio || ''} (${contrato.estado || 'N/A'})`, { 
                size: 11, 
                bold: true,
                color: contrato.estado === 'Vigente' ? rgb(0, 0.5, 0) : rgb(0, 0, 0)
            });
            
            addText(`   Desde: ${fechaInicio} - Hasta: ${fechaFin}`, { size: 10, indent: 15 });
            
            if (contrato.cargo) {
                addText(`   Cargo: ${contrato.cargo}`, { size: 10, indent: 15 });
            }
            
            if (contrato.horas_semanales) {
                addText(`   Horas semanales: ${contrato.horas_semanales}`, { size: 10, indent: 15 });
            }
            
            if (contrato.remuneracion) {
                addText(`   Remuneración: $${Number(contrato.remuneracion).toFixed(2)}`, { size: 10, indent: 15 });
            }

            // Materias
            if (contrato.materias && contrato.materias.length > 0) {
                addText(`   Materias:`, { size: 10, indent: 15 });
                contrato.materias.forEach(materia => {
                    addText(`      - ${materia.descripcion}`, { size: 9, indent: 20 });
                });
            }

            yPosition -= 5;
        });
    } else {
        addText('Sin contratos registrados', { size: 11 });
    }

    yPosition -= 10;
    addLine();

    // ===== DOCUMENTACIÓN ADICIONAL =====
    addText('DOCUMENTACIÓN ADICIONAL', { size: 14, bold: true });
    yPosition -= 5;

    const documentos = informe.documentos || [];
    if (documentos.length > 0) {
        documentos.forEach((doc, index) => {
            if (yPosition < margin + 80) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                yPosition = pageHeight - margin;
            }

            addText(`${index + 1}. ${doc.nombre_documento || 'Sin nombre'}`, { size: 11 });
            addText(`   Tipo: ${doc.tipo_documento || 'N/A'}`, { size: 10, indent: 15 });
            
            if (doc.fecha_emision) {
                addText(`   Fecha: ${formatearFecha(doc.fecha_emision)}`, { size: 10, indent: 15 });
            }
            
            addText(`   Estado: ${doc.estado_verificacion || 'Sin verificar'}`, { size: 10, indent: 15 });
            yPosition -= 3;
        });
    } else {
        addText('Sin documentos adicionales registrados', { size: 11 });
    }

    yPosition -= 20;
    addLine();

    // ===== PIE DE PÁGINA =====
    addText('Este informe es un documento generado automáticamente por el sistema SIGELED.', { 
        size: 9, 
        color: rgb(0.5, 0.5, 0.5) 
    });
    addText(`Fecha de generación: ${new Date().toLocaleString('es-AR')}`, { 
        size: 9, 
        color: rgb(0.5, 0.5, 0.5) 
    });

    // Serializar el PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}

/**
 * Genera un reporte de estadísticas en PDF
 */
export async function generateEstadisticasPDF(estadisticas) {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;

    const addText = (text, options = {}) => {
        const { size = 12, bold = false, indent = 0, color = rgb(0, 0, 0) } = options;
        const actualFont = bold ? fontBold : font;

        if (yPosition < margin + 50) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
        }

        page.drawText(text, {
            x: margin + indent,
            y: yPosition,
            size,
            font: actualFont,
            color
        });

        yPosition -= size + 5;
    };

    const addLine = () => {
        page.drawLine({
            start: { x: margin, y: yPosition },
            end: { x: pageWidth - margin, y: yPosition },
            thickness: 0.5,
            color: rgb(0.5, 0.5, 0.5)
        });
        yPosition -= 15;
    };

    // Encabezado
    addText('REPORTE DE ESTADÍSTICAS - SIGELED', { size: 18, bold: true });
    addText(`Generado el: ${new Date().toLocaleString('es-AR')}`, { size: 10 });
    yPosition -= 10;
    addLine();

    // Estadísticas generales
    if (estadisticas.generales) {
        addText('ESTADÍSTICAS GENERALES', { size: 14, bold: true });
        yPosition -= 5;

        const g = estadisticas.generales;
        addText(`Total de personas: ${g.total_personas || 0}`, { size: 11 });
        addText(`Total de profesores: ${g.total_profesores || 0}`, { size: 11 });
        addText(`Total de contratos: ${g.total_contratos || 0}`, { size: 11 });
        addText(`Contratos activos: ${g.contratos_activos || 0}`, { size: 11 });
        addText(`Total de títulos: ${g.total_titulos || 0}`, { size: 11 });
        addText(`Títulos verificados: ${g.titulos_verificados || 0}`, { size: 11 });
        addText(`Total de documentos: ${g.total_documentos || 0}`, { size: 11 });
        addText(`Usuarios activos: ${g.usuarios_activos || 0}`, { size: 11 });

        yPosition -= 10;
        addLine();
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}
