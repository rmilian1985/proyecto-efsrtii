/**
 * ==============================================================================
 * CAPA CONTROLADORA (HTTP): clienteController.js
 * Responsabilidad: Recibir peticiones HTTP, extraer parámetros, delegar
 * al Servicio y devolver respuestas en formato JSON.
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const clienteService = require('../services/clienteService');

class ClienteController {
  async listar(req, res) {
    try {
      const clientes = await clienteService.listarClientes();
      res.status(200).json({
        success: true,
        data: clientes
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
      const cliente = await clienteService.obtenerPorId(req.params.id);
      res.status(200).json({
        success: true,
        data: cliente
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async registrar(req, res) {
    try {
      const nuevoCliente = await clienteService.registrarCliente(req.body);
      res.status(201).json({
        success: true,
        message: 'Cliente registrado exitosamente',
        data: nuevoCliente
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ClienteController();
