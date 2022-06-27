import * as chai from "chai";
import * as sinon from "sinon";
import * as proxyquire from "proxyquire";
import { IPagerRepository } from "../../../../src/domain/ports/out";
import AcknowledgeTimeoutUseCaseTS from "../../../../src/application/useCases/AcknowledgeTimeout";
import {
  getMonitoredServiceInputData,
  getMonitoredServiceAcknowledgedInputData,
} from "../../../mocks/monitoredService";
import {
  ServiceIsAlreadyAcknowledgedException,
  ValidationException,
} from "../../../../src/domain/exception";

const { expect } = chai;
const { stub } = sinon;

const validateAcknowledgeTimeoutValidator = stub();
const getErrorsAcknowledgeTimeoutValidatorStub = stub();
const acknowledgeTimeoutValidatorStub = {
  default: stub().returns({
    validate: validateAcknowledgeTimeoutValidator,
    getErrors: getErrorsAcknowledgeTimeoutValidatorStub,
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

const AcknowledgeTimeoutUseCase = proxyquire(
  "../../../../src/application/useCases/AcknowledgeTimeout",
  {
    "../validator/AcknowledgeTimeoutValidator": acknowledgeTimeoutValidatorStub,
  }
).default;

const acknowledgeTimeoutUseCase: AcknowledgeTimeoutUseCaseTS = new AcknowledgeTimeoutUseCase(
  pagerRepositoryStub
);

describe("src/application/useCases/example/AcknowledgeTimeoutUseCase", async function () {
  beforeEach(function () {
    validateAcknowledgeTimeoutValidator.resolves(true);
    getErrorsAcknowledgeTimeoutValidatorStub.resolves([]);
    getMonitoredServiceStub.resolves(getMonitoredServiceInputData());
    setMonitoredServiceStub.resolves();
  });

  afterEach(function () {
    validateAcknowledgeTimeoutValidator.reset();
    getErrorsAcknowledgeTimeoutValidatorStub.reset();
    getMonitoredServiceStub.reset();
    setMonitoredServiceStub.reset();
  });

  it("should set a monitored service to acknowledged", async function () {
    await acknowledgeTimeoutUseCase.execute({
      serviceId: "test-service-id",
    });

    expect(validateAcknowledgeTimeoutValidator.called).to.be.true;
    expect(getErrorsAcknowledgeTimeoutValidatorStub.called).to.be.false;
    expect(getMonitoredServiceStub.called).to.be.true;
    expect(
      setMonitoredServiceStub.calledWith({
        service_id: "test-service-id",
        acknowledged: true,
        healthy: false,
        escalation_level: 0,
      })
    ).to.be.true;
  });

  it("should throw a service is already acknowledged exception if the service is already acknwoledged", async function () {
    getMonitoredServiceStub.resolves(
      getMonitoredServiceAcknowledgedInputData()
    );

    try {
      await acknowledgeTimeoutUseCase.execute({
        serviceId: "test-service-id",
      });
    } catch (error) {
      expect(error).to.be.instanceof(ServiceIsAlreadyAcknowledgedException);
      expect(validateAcknowledgeTimeoutValidator.called).to.be.true;
      expect(getErrorsAcknowledgeTimeoutValidatorStub.called).to.be.false;
      expect(getMonitoredServiceStub.called).to.be.true;
      expect(setMonitoredServiceStub.called).to.be.false;
    }
  });

  it("should throw a validation error if we do not receive a service id", async function () {
    validateAcknowledgeTimeoutValidator.resolves(false);
    getErrorsAcknowledgeTimeoutValidatorStub.resolves([
      { field: "serviceId", message: '"serviceid" must be a string' },
    ]);

    try {
      await acknowledgeTimeoutUseCase.execute({
        serviceId: 123,
      });
    } catch (error) {
      expect(error).to.be.instanceof(ValidationException);
      expect(validateAcknowledgeTimeoutValidator.called).to.be.true;
      expect(getErrorsAcknowledgeTimeoutValidatorStub.called).to.be.true;
      expect(getMonitoredServiceStub.called).to.be.false;
      expect(setMonitoredServiceStub.called).to.be.false;
    }
  });
});
