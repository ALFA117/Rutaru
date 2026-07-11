// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Escrow de reservas: el cliente paga desde su propia wallet, los fondos
/// quedan retenidos en el contrato hasta que el backend confirma que el servicio
/// se completo (paga al operador) o se cancelo (reembolsa al comprador).
contract RutaruBooking is Ownable {
    enum Estado {
        Pendiente,
        Completada,
        Cancelada
    }

    struct Reserva {
        address comprador;
        address operador;
        uint256 monto;
        Estado estado;
        string folio;
    }

    mapping(uint256 => Reserva) public reservas;
    uint256 private _nextId;

    event ReservaCreada(
        uint256 indexed id,
        address indexed comprador,
        address indexed operador,
        uint256 monto,
        string folio
    );
    event ServicioCompletado(uint256 indexed id);
    event ReservaCancelada(uint256 indexed id);

    error EstadoInvalido();
    error TransferenciaFallida();

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice El cliente llama esta funcion directo desde su wallet (MetaMask)
    /// enviando el monto de la reserva en ETH de prueba. `folio` liga la reserva
    /// on-chain con su orden en Supabase.
    function crearReserva(
        address operador,
        string calldata folio
    ) external payable returns (uint256 id) {
        require(msg.value > 0, "monto requerido");
        id = _nextId++;
        reservas[id] = Reserva(msg.sender, operador, msg.value, Estado.Pendiente, folio);
        emit ReservaCreada(id, msg.sender, operador, msg.value, folio);
    }

    /// @notice Solo el backend (owner) la llama, cuando el operador marca el
    /// servicio como completado en su dashboard. Libera los fondos al operador.
    function completarServicio(uint256 id) external onlyOwner {
        Reserva storage r = reservas[id];
        if (r.estado != Estado.Pendiente) revert EstadoInvalido();
        r.estado = Estado.Completada;
        (bool ok, ) = r.operador.call{ value: r.monto }("");
        if (!ok) revert TransferenciaFallida();
        emit ServicioCompletado(id);
    }

    /// @notice Solo el backend (owner) la llama, cuando se cancela la reserva.
    /// Reembolsa el monto completo al comprador.
    function cancelarReserva(uint256 id) external onlyOwner {
        Reserva storage r = reservas[id];
        if (r.estado != Estado.Pendiente) revert EstadoInvalido();
        r.estado = Estado.Cancelada;
        (bool ok, ) = r.comprador.call{ value: r.monto }("");
        if (!ok) revert TransferenciaFallida();
        emit ReservaCancelada(id);
    }
}
