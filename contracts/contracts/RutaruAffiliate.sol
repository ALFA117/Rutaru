// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Split automatico de comision on-chain: el backend envia el monto de
/// comision (calculado sobre lo realmente pagado) y el contrato lo reenvia de
/// inmediato a la wallet del afiliado, dejando el evento como comprobante.
contract RutaruAffiliate is Ownable {
    event ComisionPagada(address indexed afiliado, uint256 monto, string folio);

    error TransferenciaFallida();

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Solo el backend (owner) la llama, al confirmarse una venta con
    /// codigo de afiliado. msg.value es la comision ya calculada.
    function pagarComision(
        address payable afiliado,
        string calldata folio
    ) external payable onlyOwner {
        require(msg.value > 0, "monto requerido");
        (bool ok, ) = afiliado.call{ value: msg.value }("");
        if (!ok) revert TransferenciaFallida();
        emit ComisionPagada(afiliado, msg.value, folio);
    }
}
