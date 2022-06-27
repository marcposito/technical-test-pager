import * as chai from "chai";
import * as sinon from "sinon";
import * as proxyquire from "proxyquire";
import { IPagerRepository } from "../../../../src/domain/ports/out";
import FlagServiceAsHealthyUseCaseTS from "../../../../src/application/useCases/FlagServiceAsHealthy";
import {
  getMonitoredServiceInputData,
  getMonitoredServiceAcknowledgedInputData,
  getMonitoredServiceHealthyInputData,
} from "../../../mocks/monitoredService";
import {
  ServiceIsHealthyException,
  ValidationException,
} from "../../../../src/domain/exception";

const { expect } = chai;
const { stub } = sinon;

const validatSetMonitoredServiceAsHealthyValidatorStub = stub();
const getErrorsSetMonitoredServiceAsHealthyValidatorStub = stub();
const setMonitoredServiceAsHealthyValidatorStub = {
  default: stub().returns({
    validate: validatSetMonitoredServiceAsHealthyValidatorStub,
    getErrors: getErrorsSetMonitoredServiceAsHealthyValidatorStub,
  }),
};

const getMonitoredServiceStub = stub();
const setMonitoredServiceStub = stub();
const pagerRepositoryStub = <IPagerRepository>{
  getMonitoredService: (serviceId: string) => {
    return getMonitoredServiceStub(serviceId);
  },
  setMonitoredService: (query: any) => {
    return setMonitoredServiceStub(query);
  },
};

const FlagServiceAsHealthyUseCase = proxyquire(
  "../../../../src/application/useCases/FlagServiceAsHealthy",
  {
    "../validator/SetMonitoredServiceAsHealthyValidator": setMonitoredServiceAsHealthyValidatorStub,
  }
).default;

const flagServiceAsHealthyUseCase: FlagServiceAsHealthyUseCaseTS = new FlagServiceAsHealthyUseCase(
  pagerRepositoryStub
);

describe("src/application/useCases/example/FlagServiceAsHealthyUseCase", async function () {
  beforeEach(function () {
    validatSetMonitoredServiceAsHealthyValidatorStub.resolves(true);
    getErrorsSetMonitoredServiceAsHealthyValidatorStub.resolves([]);
    getMonitoredServiceStub.resolves(getMonitoredServiceInputData());
    setMonitoredServiceStub.resolves();
  });

  afterEach(function () {
    validatSetMonitoredServiceAsHealthyValidatorStub.reset();
    getErrorsSetMonitoredServiceAsHealthyValidatorStub.reset();
    getMonitoredServiceStub.reset();
    setMonitoredServiceStub.reset();
  });

  it("should flag a monitored service to healthy", async function () {
    getMonitoredServiceStub.resolves(
      getMonitoredServiceAcknowledgedInputData()
    );

    await flagServiceAsHealthyUseCase.execute({
      serviceId: "test-service-id",
    });

    expect(validatSetMonitoredServiceAsHealthyValidatorStub.called).to.be.true;
    expect(getErrorsSetMonitoredServiceAsHealthyValidatorStub.called).to.be
      .false;
    expect(getMonitoredServiceStub.called).to.be.true;
    expect(
      setMonitoredServiceStub.calledWith({
        service_id: "test-service-id",
        acknowledged: true,
        healthy: true,
        escalation_level: 0,
      })
    ).to.be.true;
  });

  it("should throw a service is already flagged as healthy exception if the service is already healthy", async function () {
    getMonitoredServiceStub.resolves(getMonitoredServiceHealthyInputData());

    try {
      await flagServiceAsHealthyUseCase.execute({
        serviceId: "test-service-id",
      });
    } catch (error) {
      expect(error).to.be.instanceof(ServiceIsHealthyException);
      expect(validatSetMonitoredServiceAsHealthyValidatorStub.called).to.be
        .true;
      expect(getErrorsSetMonitoredServiceAsHealthyValidatorStub.called).to.be
        .false;
      expect(getMonitoredServiceStub.called).to.be.true;
      expect(setMonitoredServiceStub.called).to.be.false;
    }
  });

  it("should throw a validation error if we do not receive a service id", async function () {
    validatSetMonitoredServiceAsHealthyValidatorStub.resolves(true);
    getErrorsSetMonitoredServiceAsHealthyValidatorStub.resolves([
      { field: "serviceId", message: '"serviceid" must be a string' },
    ]);

    try {
      await flagServiceAsHealthyUseCase.execute({
        serviceId: 123,
      });
    } catch (error) {
      expect(error).to.be.instanceof(ValidationException);
      expect(validatSetMonitoredServiceAsHealthyValidatorStub.called).to.be
        .true;
      expect(getErrorsSetMonitoredServiceAsHealthyValidatorStub.called).to.be
        .true;
      expect(getMonitoredServiceStub.called).to.be.false;
      expect(setMonitoredServiceStub.called).to.be.false;
    }
  });
});
