import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

async function deployBookingFixture() {
  const [owner, cliente, operador, otro] = await ethers.getSigners();
  const booking = await ethers.deployContract("RutaruBooking", [owner.address]);
  const monto = ethers.parseEther("0.0002");
  return { booking, owner, cliente, operador, otro, monto };
}

async function deployBookingConReservaFixture() {
  const base = await deployBookingFixture();
  const tx = await base.booking
    .connect(base.cliente)
    .crearReserva(base.operador.address, "FOLIO-ORDEN-1", { value: base.monto });
  await tx.wait();
  return base;
}

describe("RutaruBooking", function () {
  it("crearReserva guarda la reserva, retiene los fondos y emite el evento", async function () {
    const { booking, cliente, operador, monto } = await networkHelpers.loadFixture(
      deployBookingFixture
    );

    await expect(
      booking.connect(cliente).crearReserva(operador.address, "FOLIO-ORDEN-1", { value: monto })
    )
      .to.emit(booking, "ReservaCreada")
      .withArgs(0n, cliente.address, operador.address, monto, "FOLIO-ORDEN-1");

    const reserva = await booking.reservas(0n);
    expect(reserva.comprador).to.equal(cliente.address);
    expect(reserva.operador).to.equal(operador.address);
    expect(reserva.monto).to.equal(monto);
    expect(reserva.estado).to.equal(0n); // Pendiente
    expect(reserva.folio).to.equal("FOLIO-ORDEN-1");
    expect(await ethers.provider.getBalance(await booking.getAddress())).to.equal(monto);
  });

  it("crearReserva sin ETH revierte", async function () {
    const { booking, cliente, operador } = await networkHelpers.loadFixture(deployBookingFixture);

    await expect(
      booking.connect(cliente).crearReserva(operador.address, "FOLIO-ORDEN-1", { value: 0n })
    ).to.be.revertedWith("monto requerido");
  });

  it("completarServicio libera los fondos al operador (owner)", async function () {
    const { booking, owner, operador, monto } = await networkHelpers.loadFixture(
      deployBookingConReservaFixture
    );

    await expect(booking.connect(owner).completarServicio(0n)).to.changeEtherBalance(
      ethers,
      operador,
      monto
    );

    const reserva = await booking.reservas(0n);
    expect(reserva.estado).to.equal(1n); // Completada
  });

  it("completarServicio emite ServicioCompletado", async function () {
    const { booking, owner } = await networkHelpers.loadFixture(deployBookingConReservaFixture);

    await expect(booking.connect(owner).completarServicio(0n))
      .to.emit(booking, "ServicioCompletado")
      .withArgs(0n);
  });

  it("completarServicio rechaza a quien no es el owner (backend)", async function () {
    const { booking, otro } = await networkHelpers.loadFixture(deployBookingConReservaFixture);

    await expect(booking.connect(otro).completarServicio(0n))
      .to.be.revertedWithCustomError(booking, "OwnableUnauthorizedAccount")
      .withArgs(otro.address);
  });

  it("completarServicio no se puede llamar dos veces", async function () {
    const { booking, owner } = await networkHelpers.loadFixture(deployBookingConReservaFixture);

    await booking.connect(owner).completarServicio(0n);

    await expect(booking.connect(owner).completarServicio(0n)).to.be.revertedWithCustomError(
      booking,
      "EstadoInvalido"
    );
  });

  it("cancelarReserva reembolsa al comprador (owner)", async function () {
    const { booking, owner, cliente, monto } = await networkHelpers.loadFixture(
      deployBookingConReservaFixture
    );

    await expect(booking.connect(owner).cancelarReserva(0n)).to.changeEtherBalance(
      ethers,
      cliente,
      monto
    );

    const reserva = await booking.reservas(0n);
    expect(reserva.estado).to.equal(2n); // Cancelada
  });

  it("cancelarReserva emite ReservaCancelada", async function () {
    const { booking, owner } = await networkHelpers.loadFixture(deployBookingConReservaFixture);

    await expect(booking.connect(owner).cancelarReserva(0n))
      .to.emit(booking, "ReservaCancelada")
      .withArgs(0n);
  });

  it("cancelarReserva rechaza a quien no es el owner (backend)", async function () {
    const { booking, otro } = await networkHelpers.loadFixture(deployBookingConReservaFixture);

    await expect(booking.connect(otro).cancelarReserva(0n))
      .to.be.revertedWithCustomError(booking, "OwnableUnauthorizedAccount")
      .withArgs(otro.address);
  });

  it("no se puede cancelar una reserva ya completada", async function () {
    const { booking, owner } = await networkHelpers.loadFixture(deployBookingConReservaFixture);

    await booking.connect(owner).completarServicio(0n);

    await expect(booking.connect(owner).cancelarReserva(0n)).to.be.revertedWithCustomError(
      booking,
      "EstadoInvalido"
    );
  });
});
