/**
 * ==============================================================================
 * CAPA CONTROLADORA (HTTP): reporteController.js
 * Responsabilidad: Exponer endpoints para obtener el reporte consolidado de
 * inventario y ventas (sp_ReporteConsolidadoInventario) y los KPIs.
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const reporteService = require('../services/reporteService');

class ReporteController {
  async consolidadoInventario(req, res) {
    try {
      const reporte = await reporteService.obtenerReporteConsolidado();
      res.status(200).json({
        success: true,
        data: reporte
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async dashboardKpis(req, res) {
    try {
      const kpis = await reporteService.obtenerDashboardKpis();
      res.status(200).json({
        success: true,
        data: kpis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ReporteController();
