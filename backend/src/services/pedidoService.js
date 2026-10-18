/**
 * ==============================================================================
 * CAPA DE LÓGICA DE NEGOCIO (BLL): pedidoService.js
 * Responsabilidad: Orquestar el procesamiento de pedidos institucionales,
 * validar entradas, calcular tiempos de ejecución para el indicador SMART
 * y coordinar con el repositorio transaccional.
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const { performance } = require('perf_hooks');
const pedidoRepository = require('../repositories/pedidoRepository');

class PedidoService {
  /**
   * Procesa un pedido institucional individual utilizando sp_ProcesarPedidoInstitucional
   */
  async procesarPedidoInstitucional({ idCliente, idProducto, cantidadSolicitada }) {
    if (!idCliente || isNaN(idCliente)) {
      throw new Error('Debe especificar un ID de cliente válido.');
    }
    if (!idProducto || isNaN(idProducto)) {
      throw new Error('Debe especificar un ID de producto válido.');
    }
    if (!cantidadSolicitada || cantidadSolicitada <= 0) {
      throw new Error('La cantidad solicitada debe ser un número entero mayor a cero.');
    }

    // Cronometraje para medir el indicador SMART del proyecto (T_con vs T_sin = 900s)
    const tInicio = performance.now();

    const resultadoTransaccion = await pedidoRepository.procesarPedidoInstitucional(
      parseInt(idCliente, 10),
      parseInt(idProducto, 10),
      parseInt(cantidadSolicitada, 10)
    );

    const tFin = performance.now();
    const tiempoEjecucionMs = parseFloat((tFin - tInicio).toFixed(2));

    // Cálculo del indicador SMART: Reducción porcentual respecto al proceso manual de 15 min (900s)
    const tiempoManualSegundos = 900;
    const tiempoSistemaSegundos = (tiempoEjecucionMs / 1000);
    const porcentajeAhorro = parseFloat((((tiempoManualSegundos - tiempoSistemaSegundos) / tiempoManualSegundos) * 100).toFixed(2));

    return {
      ...resultadoTransaccion,
      indicadorSmart: {
        tiempoEjecucionMs,
        tiempoSistemaSegundos,
        tiempoManualReferenciaSegundos: tiempoManualSegundos,
        porcentajeEficiencia: porcentajeAhorro,
        metaAlcanzada: porcentajeAhorro >= 86.0
      }
    };
  }

  /**
   * Procesa una lista de múltiples productos en un solo pedido
   */
  async procesarPedidoMultiple({ idCliente, items }) {
    if (!idCliente || isNaN(idCliente)) {
      throw new Error('Debe seleccionar un cliente válido.');
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Debe agregar al menos un producto al pedido.');
    }

    const tInicio = performance.now();
    const resultadosItems = [];
    let todosExitosos = true;

    for (const item of items) {
      const res = await pedidoRepository.procesarPedidoInstitucional(
        parseInt(idCliente, 10),
        parseInt(item.idProducto, 10),
        parseInt(item.cantidad, 10)
      );
      resultadosItems.push({
        idProducto: item.idProducto,
        nombreProducto: item.nombreProducto,
        cantidad: item.cantidad,
        resultado: res.resultado,
        mensaje: res.mensaje
      });

      if (res.resultado !== 1) {
        todosExitosos = false;
      }
    }

    const tFin = performance.now();
    const tiempoEjecucionMs = parseFloat((tFin - tInicio).toFixed(2));

    return {
      exitoGlobal: todosExitosos,
      detalles: resultadosItems,
      tiempoEjecucionMs,
      mensaje: todosExitosos 
        ? 'Todos los productos del pedido fueron procesados y descontados con éxito.' 
        : 'Uno o más productos no pudieron procesarse por stock insuficiente.'
    };
  }

  async listarPedidos() {
    return await pedidoRepository.getAll();
  }

  async obtenerDetallePedido(idPedido) {
    if (!idPedido || isNaN(idPedido)) {
      throw new Error('El ID de pedido proporcionado no es válido.');
    }
    return await pedidoRepository.getDetalle(idPedido);
  }
}

module.exports = new PedidoService();
