/**
 * ==============================================================================
 * CAPA DE LÓGICA DE NEGOCIO (BLL): clienteService.js
 * Responsabilidad: Reglas y validaciones de negocio para la entidad Cliente.
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const clienteRepository = require('../repositories/clienteRepository');

class ClienteService {
  async listarClientes() {
    return await clienteRepository.getAll();
  }

  async obtenerPorId(id) {
    if (!id || isNaN(id)) {
      throw new Error('El ID de cliente proporcionado no es válido.');
    }
    const cliente = await clienteRepository.getById(id);
    if (!cliente) {
      throw new Error(`No se encontró el cliente con ID ${id}`);
    }
    return cliente;
  }

  async registrarCliente(datos) {
    const { rucDni, razonSocial, direccion, telefono } = datos;

    if (!rucDni || !razonSocial || !direccion || !telefono) {
      throw new Error('Todos los campos son obligatorios: rucDni, razonSocial, direccion y telefono.');
    }

    if (rucDni.length !== 8 && rucDni.length !== 11) {
      throw new Error('El RUC debe tener 11 dígitos o el DNI 8 dígitos.');
    }

    return await clienteRepository.create(datos);
  }
}

module.exports = new ClienteService();
