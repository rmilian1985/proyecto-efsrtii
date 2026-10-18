/**
 * ==============================================================================
 * CAPA DE LÓGICA DE NEGOCIO (BLL): reporteService.js
 * Responsabilidad: Generar datos consolidados para reportes gerenciales
 * y estructuración de KPIs.
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const reporteRepository = require('../repositories/reporteRepository');

class ReporteService {
  async obtenerReporteConsolidado() {
    const data = await reporteRepository.getReporteConsolidado();

    // Enriquecimiento de métricas para la UI y exportación
    let totalValorInventario = 0;
    let totalUnidadesVendidas = 0;

    data.forEach(item => {
      totalValorInventario += parseFloat(item.ValorTotalInventario) || 0;
      totalUnidadesVendidas += parseInt(item.TotalUnidadesVendidas, 10) || 0;
    });

    return {
      resumen: {
        totalItems: data.length,
        totalValorInventario: parseFloat(totalValorInventario.toFixed(2)),
        totalUnidadesVendidas: totalUnidadesVendidas,
        fechaGeneracion: new Date().toISOString()
      },
      filas: data
    };
  }

  async obtenerDashboardKpis() {
    return await reporteRepository.getKpis();
  }
}

module.exports = new ReporteService();
