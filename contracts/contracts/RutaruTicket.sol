// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice NFT-ticket: un token por boleto/reserva comprado con blockchain activado.
contract RutaruTicket is ERC721, Ownable {
    uint256 private _nextTokenId;
    mapping(uint256 => string) private _tokenURIs;

    event TicketMinted(uint256 indexed tokenId, address indexed to, string folio);

    constructor(address initialOwner) ERC721("RutaruTicket", "RTKT") Ownable(initialOwner) {}

    /// @notice Acuna un ticket al comprador. Solo el backend (owner) puede llamarla,
    /// justo despues de confirmar el pago en el checkout con cripto.
    function mintTicket(
        address to,
        string calldata folio,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = metadataURI;
        emit TicketMinted(tokenId, to, folio);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }
}
