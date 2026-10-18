/**
 * ==============================================================================
 * CAPA DE ACCESO A DATOS (DAL): clienteRepository.js
 * Responsabilidad: Interactuar directamente con la tabla 'Cliente' en SQL Server.
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const { getPool, sql } = require('../config/db');
const memoryStore = require('../config/seedMemory');

class ClienteRepository {
  async getAll() {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request().query(`
        SELECT IdCliente, RUC_DNI, RazonSocial, Direccion, Telefono
        FROM Cliente
        ORDER BY RazonSocial ASC;
      `);
      return result.recordset;
    }
    // Fallback en memoria
    return memoryStore.clientes;
  }

  async getById(id) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('IdCliente', sql.Int, id)
        .query(`
          SELECT IdCliente, RUC_DNI, RazonSocial, Direccion, Telefono
          FROM Cliente
          WHERE IdCliente = @IdCliente;
        `);
      return result.recordset[0] || null;
    }
    return memoryStore.clientes.find(c => c.IdCliente === parseInt(id, 10)) || null;
  }

  async create({ rucDni, razonSocial, direccion, telefono }) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('RUC_DNI', sql.VarChar(15), rucDni)
        .input('RazonSocial', sql.VarChar(150), razonSocial)
        .input('Direccion', sql.VarChar(200), direccion)
        .input('Telefono', sql.VarChar(20), telefono)
        .query(`
          INSERT INTO Cliente (RUC_DNI, RazonSocial, Direccion, Telefono)
          VALUES (@RUC_DNI, @RazonSocial, @Direccion, @Telefono);
          SELECT SCOPE_IDENTITY() AS IdCliente;
        `);
      return { id: result.recordset[0].IdCliente, rucDni, razonSocial, direccion, telefono };
    }
    const newId = memoryStore.clientes.length + 1;
    const newClient = { IdCliente: newId, RUC_DNI: rucDni, RazonSocial: razonSocial, Direccion: direccion, Telefono: telefono };
    memoryStore.clientes.push(newClient);
    return newClient;
  }
}

module.exports = new ClienteRepository();
