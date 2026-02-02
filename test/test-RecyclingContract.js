const RecyclingContract = artifacts.require("RecyclingContract");

contract("RecyclingContract", (accounts) => {
  let contract;

  const NEA = accounts[0];       // deployer
  const recycler = accounts[1];  // recycler account

  before(async () => {
    contract = await RecyclingContract.deployed();
  });

  it("should set NEA as deployer", async () => {
    const neaAddress = await contract.NEA();
    assert.equal(neaAddress, NEA, "NEA should be deployer");
  });

  it("NEA can add a recycler", async () => {
    await contract.addRecycler(recycler, { from: NEA });
    const isRecycler = await contract.isRecycler(recycler);
    assert.equal(isRecycler, true, "Recycler should be added");
  });

  it("Recycler can register an item", async () => {
    await contract.registerItem(
      "item01",
      "John",
      "Plastic",
      5,
      1,
      { from: recycler }
    );

    const item = await contract.getItemSummary(1);
    assert.equal(item.itemId, "item01", "Item ID should match");
    assert.equal(item.recyclerName, "John", "Recycler name should match");
  });

  it("NEA can approve the item", async () => {
    await contract.reviewItem(1, true, { from: NEA });
    const item = await contract.getItemSummary(1);
    assert.equal(item.status.toString(), "2", "Status should be Confirmed (2)");
  });
});
