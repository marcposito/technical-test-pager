import { expect } from "chai";
import EscalationPolicy from "../../../../src/domain/model/EscalationPolicy";
import { getEscalationPolicyInputData } from "../../../mocks/escalationPolicy";

const mockData = getEscalationPolicyInputData();

describe("src/domain/model/EscalationPolicy", () => {
  it("should create a monitored service", async function () {
    expect(() => {
      EscalationPolicy.fromJSON(mockData);
    }).to.not.throw();
  });

  it("should get() methods return the expected value", async function () {
    const monitoredService = EscalationPolicy.fromJSON(mockData);

    expect(monitoredService.id).to.be.equals(mockData.id);
    expect(monitoredService.serviceId).to.be.equals(mockData.service_id);
    expect(monitoredService.levels).to.deep.equals(mockData.levels);
  });
});
