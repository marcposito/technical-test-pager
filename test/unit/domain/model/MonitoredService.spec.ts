import { expect } from "chai";
import MonitoredService from "../../../../src/domain/model/MonitoredService";
import { getMonitoredServiceInputData } from "../../../mocks/monitoredService";

const mockData = getMonitoredServiceInputData();

describe("src/domain/model/MonitoredService", () => {
  it("should create a monitored service", async function () {
    expect(() => {
      MonitoredService.fromJSON(mockData);
    }).to.not.throw();
  });

  it("should get() methods return the expected value", async function () {
    const monitoredService = MonitoredService.fromJSON(mockData);

    expect(monitoredService.serviceId).to.be.equals(mockData.service_id);
    expect(monitoredService.acknowledged).to.be.equals(mockData.acknowledged);
    expect(monitoredService.healthy).to.be.equals(mockData.healthy);
    expect(monitoredService.escalationLevel).to.be.equals(
      mockData.escalation_level
    );
  });
});
