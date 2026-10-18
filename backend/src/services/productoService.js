/**
 * ==============================================================================
 * CAPA DE LÓGICA DE NEGOCIO (BLL): productoService.js
 * Responsabilidad: Reglas y consultas de negocio para Productos y Categorías.
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const productoRepository = require('../repositories/productoRepository');

class ProductoService {
  async listarProductos() {
    return await productoRepository.getAll();
  }

  async obtenerPorId(id) {
    if (!id || isNaN(id)) {
      throw new Error('El ID de producto proporcionado no es válido.');
    }
    const producto = await productoRepository.getById(id);
    if (!producto) {
      throw new Error(`No se encontró el producto con ID ${id}`);
    }
    return producto;
  }

  async listarCategorias() {
    return await productoRepository.getCategorias();
  }
}

module.exports = new ProductoService();
