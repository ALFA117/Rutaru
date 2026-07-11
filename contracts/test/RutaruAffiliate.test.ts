import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

async function deployAffiliateFixture() {
  const [owner, afiliado, otro] = await ethers.getSigners();
  const affiliate = await ethers.deployContract("RutaruAffiliate", [owner.address]);
  const comision = ethers.parseEther("0.00002");
  return { affiliate, owner, afiliado, otro, comision };
}

describe("RutaruAffiliate", function () {
  it("pagarComision reenvia los fondos al afiliado y emite el evento", async function () {
    const { affiliate, owner, afiliado, comision } = await networkHelpers.loadFixture(
      deployAffiliateFixture
    );

    await expect(
      affiliate.connect(owner).pagarComision(afiliado.address, "FOLIO-1", {
        value: comision,
      })
    ).to.changeEtherBalance(ethers, afiliado, comision);
  });

  it("emite ComisionPagada con el monto y folio correctos", async function () {
    const { affiliate, owner, afiliado, comision } = await networkHelpers.loadFixture(
      deployAffiliateFixture
    );

    await expect(
      affiliate.connect(owner).pagarComision(afiliado.address, "FOLIO-1", { value: comision })
    )
      .to.emit(affiliate, "ComisionPagada")
      .withArgs(afiliado.address, comision, "FOLIO-1");
  });

  it("rechaza pagar sin ETH", async function () {
    const { affiliate, owner, afiliado } = await networkHelpers.loadFixture(
      deployAffiliateFixture
    );

    await expect(
      affiliate.connect(owner).pagarComision(afiliado.address, "FOLIO-1", { value: 0n })
    ).to.be.revertedWith("monto requerido");
  });

  it("rechaza a quien no es el owner (backend)", async function () {
    const { affiliate, afiliado, otro, comision } = await networkHelpers.loadFixture(
      deployAffiliateFixture
    );

    await expect(
      affiliate.connect(otro).pagarComision(afiliado.address, "FOLIO-1", { value: comision })
    )
      .to.be.revertedWithCustomError(affiliate, "OwnableUnauthorizedAccount")
      .withArgs(otro.address);
  });
});
