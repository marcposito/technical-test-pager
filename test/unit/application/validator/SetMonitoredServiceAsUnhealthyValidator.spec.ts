import { expect } from "chai";
import SetMonitoredServiceAsUnhealthyValidator from "../../../../src/application/validator/SetMonitoredServiceAsUnhealthyValidator";

describe("src/application/validator/SetMonitoredServiceAsHealthyValidator.ts", async function () {
  it("should create a SetMonitoredServiceAsUnhealthyValidator", async function () {
    expect(() => {
      new SetMonitoredServiceAsUnhealthyValidator();
    }).to.not.throw();
  });

  it("should validate input service id", async function () {
    const validator = new SetMonitoredServiceAsUnhealthyValidator();

    expect(await validator.validate({ serviceId: "test-service-id" })).to.be
      .true;
    expect(validator.getErrors()).to.be.deep.equals([]);
  });

  it("should return errors if validate fails", async function () {
    const validator = new SetMonitoredServiceAsUnhealthyValidator();

    expect(await validator.validate({ serviceId: 123 })).to.be.false;
    expect(validator.getErrors()).to.be.deep.equals([
      { field: "serviceId", message: '"serviceid" must be a string' },
    ]);
  });
});
