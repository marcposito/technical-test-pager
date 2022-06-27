import { expect } from "chai";
import SetMonitoredServiceAsHealthyValidator from "../../../../src/application/validator/SetMonitoredServiceAsHealthyValidator";

describe("src/application/validator/SetMonitoredServiceAsHealthyValidator.ts", async function () {
  it("should create a SetMonitoredServiceAsHealthyValidator", async function () {
    expect(() => {
      new SetMonitoredServiceAsHealthyValidator();
    }).to.not.throw();
  });

  it("should validate input service id", async function () {
    const validator = new SetMonitoredServiceAsHealthyValidator();

    expect(await validator.validate({ serviceId: "test-service-id" })).to.be
      .true;
    expect(validator.getErrors()).to.be.deep.equals([]);
  });

  it("should return errors if validate fails", async function () {
    const validator = new SetMonitoredServiceAsHealthyValidator();

    expect(await validator.validate({ serviceId: 123 })).to.be.false;
    expect(validator.getErrors()).to.be.deep.equals([
      { field: "serviceId", message: '"serviceid" must be a string' },
    ]);
  });
});
