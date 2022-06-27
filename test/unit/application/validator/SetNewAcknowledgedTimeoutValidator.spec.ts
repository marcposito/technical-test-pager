import { expect } from "chai";
import SetNewAcknowledgedTimeoutValidator from "../../../../src/application/validator/SetNewAcknowledgedTimeoutValidator";

describe("src/application/validator/SetNewAcknowledgedTimeoutValidator.ts", async function () {
  it("should create a SetNewAcknowledgedTimeoutValidator", async function () {
    expect(() => {
      new SetNewAcknowledgedTimeoutValidator();
    }).to.not.throw();
  });

  it("should validate input service id", async function () {
    const validator = new SetNewAcknowledgedTimeoutValidator();

    expect(await validator.validate({ serviceId: "test-service-id" })).to.be
      .true;
    expect(validator.getErrors()).to.be.deep.equals([]);
  });

  it("should return errors if validate fails", async function () {
    const validator = new SetNewAcknowledgedTimeoutValidator();

    expect(await validator.validate({ serviceId: 123 })).to.be.false;
    expect(validator.getErrors()).to.be.deep.equals([
      { field: "serviceId", message: '"serviceid" must be a string' },
    ]);
  });
});
