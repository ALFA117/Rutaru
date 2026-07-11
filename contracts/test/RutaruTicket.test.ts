import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

async function deployTicketFixture() {
  const [owner, cliente, otro] = await ethers.getSigners();
  const ticket = await ethers.deployContract("RutaruTicket", [owner.address]);
  return { ticket, owner, cliente, otro };
}

describe("RutaruTicket", function () {
  it("el owner puede acuñar un ticket y el cliente recibe el NFT", async function () {
    const { ticket, cliente } = await networkHelpers.loadFixture(deployTicketFixture);

    await expect(ticket.mintTicket(cliente.address, "FOLIO-1", "data:application/json,{}"))
      .to.emit(ticket, "TicketMinted")
      .withArgs(0n, cliente.address, "FOLIO-1");

    expect(await ticket.ownerOf(0n)).to.equal(cliente.address);
  });

  it("tokenURI devuelve la metadata guardada al acuñar", async function () {
    const { ticket, cliente } = await networkHelpers.loadFixture(deployTicketFixture);
    const uri = "data:application/json,{\"folio\":\"FOLIO-1\"}";

    await ticket.mintTicket(cliente.address, "FOLIO-1", uri);

    expect(await ticket.tokenURI(0n)).to.equal(uri);
  });

  it("incrementa el tokenId en cada mint", async function () {
    const { ticket, cliente } = await networkHelpers.loadFixture(deployTicketFixture);

    await ticket.mintTicket(cliente.address, "FOLIO-1", "uri-1");
    await ticket.mintTicket(cliente.address, "FOLIO-2", "uri-2");

    expect(await ticket.ownerOf(0n)).to.equal(cliente.address);
    expect(await ticket.ownerOf(1n)).to.equal(cliente.address);
    expect(await ticket.tokenURI(1n)).to.equal("uri-2");
  });

  it("rechaza el mint si quien llama no es el owner (backend)", async function () {
    const { ticket, cliente, otro } = await networkHelpers.loadFixture(deployTicketFixture);

    await expect(
      ticket.connect(otro).mintTicket(cliente.address, "FOLIO-1", "uri")
    )
      .to.be.revertedWithCustomError(ticket, "OwnableUnauthorizedAccount")
      .withArgs(otro.address);
  });

  it("tokenURI de un token inexistente revierte", async function () {
    const { ticket } = await networkHelpers.loadFixture(deployTicketFixture);

    await expect(ticket.tokenURI(999n)).to.revert(ethers);
  });
});
