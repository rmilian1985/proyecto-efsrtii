/**
 * ==============================================================================
 * CAPA CONTROLADORA (HTTP): productoController.js
 * Responsabilidad: Manejar peticiones para catálogo de productos y categorías.
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const productoService = require('../services/productoService');

class ProductoController {
  async listar(req, res) {
    try {
      const productos = await productoService.listarProductos();
      res.status(200).json({
        success: true,
        data: productos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const producto = await productoService.obtenerPorId(req.params.id);
      res.status(200).json({
        success: true,
        data: producto
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarCategorias(req, res) {
    try {
      const categorias = await productoService.listarCategorias();
      res.status(200).json({
        success: true,
        data: categorias
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ProductoController();
