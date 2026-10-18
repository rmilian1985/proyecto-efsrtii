/**
 * ==============================================================================
 * CAPA CONTROLADORA (HTTP): pedidoController.js
 * Responsabilidad: Endpoint para procesar pedidos institucionales utilizando
 * el Stored Procedure y consultas de historial de pedidos.
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const pedidoService = require('../services/pedidoService');

class PedidoController {
  /**
   * Endpoint de evaluación: Ejecuta sp_ProcesarPedidoInstitucional
   * POST /api/pedidos/procesar
   */
  async procesar(req, res) {
    try {
      const { idCliente, idProducto, cantidadSolicitada } = req.body;
      const resultado = await pedidoService.procesarPedidoInstitucional({
        idCliente,
        idProducto,
        cantidadSolicitada
      });

      // Si el Stored Procedure retorna 0 (stock insuficiente), retornamos 200 con estado de negocio
      // Si retorna 1, retorno 200/201 con éxito
      // Si retorna -1, error de negocio
      const statusCode = resultado.resultado === 1 ? 201 : 200;

      res.status(statusCode).json({
        success: resultado.resultado === 1,
        ...resultado
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        resultado: -1,
        message: error.message
      });
    }
  }

  /**
   * Endpoint para pedidos institucionales con múltiples ítems
   * POST /api/pedidos/procesar-multiple
   */
  async procesarMultiple(req, res) {
    try {
      const { idCliente, items } = req.body;
      const resultado = await pedidoService.procesarPedidoMultiple({ idCliente, items });

      res.status(resultado.exitoGlobal ? 201 : 200).json({
        success: resultado.exitoGlobal,
        ...resultado
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async listar(req, res) {
    try {
      const pedidos = await pedidoService.listarPedidos();
      res.status(200).json({
        success: true,
        data: pedidos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async obtenerDetalle(req, res) {
    try {
      const detalles = await pedidoService.obtenerDetallePedido(req.params.id);
      res.status(200).json({
        success: true,
        data: detalles
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PedidoController();
