import { expect } from "chai";
import AcknowledgeTimeoutValidator from "../../../../src/application/validator/AcknowledgeTimeoutValidator";

describe("src/application/validator/AcknowledgeTimeoutValidator.ts", async function () {
  it("should create a AcknowledgeTimeoutValidator", async function () {
    expect(() => {
      new AcknowledgeTimeoutValidator();
    }).to.not.throw();
  });

  it("should validate input service id", async function () {
    const validator = new AcknowledgeTimeoutValidator();

    expect(await validator.validate({ serviceId: "test-service-id" })).to.be
      .true;
    expect(validator.getErrors()).to.be.deep.equals([]);
  });

  it("should return errors if validate fails", async function () {
    const validator = new AcknowledgeTimeoutValidator();

    expect(await validator.validate({ serviceId: 123 })).to.be.false;
    expect(validator.getErrors()).to.be.deep.equals([
      { field: "serviceId", message: '"serviceid" must be a string' },
    ]);
  });
});
