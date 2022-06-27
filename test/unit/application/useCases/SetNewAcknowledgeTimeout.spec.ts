import * as sinon from "sinon";
import * as proxyquire from "proxyquire";
import {
  IPagerRepository,
  ISmsService,
  IEmailService,
  ITimerService,
  IEscalationPolicyService,
} from "../../../../src/domain/ports/out";
import SetNewAcknowledgeTimeoutUseCaseTS from "../../../../src/application/useCases/SetNewAcknowledgeTimeout";
import {
  getMonitoredServiceAcknowledgedInputData,
  getMonitoredServiceHealthyNoAcknowledgedInputData,
  getMonitoredServiceInputData,
  getMonitoredServiceInputDataNoAvailableLevels,
} from "../../../mocks/monitoredService";
import { getEscalationPolicyInputData } from "../../../mocks/escalationPolicy";
import { expect } from "chai";
import {
  ServiceIsHealthyException,
  ValidationException,
  ServiceIsAlreadyAcknowledgedException,
  ServiceDoesNotHaveMoreLevelsException,
} from "../../../../src/domain/exception";

const { stub } = sinon;

const validatSetNewAcknowledgeTimeoutValidatorStub = stub();
const getErrorsSetNewAcknowledgeTimeoutValidatorStub = stub();
const setNewAcknowledgeTimeoutValidatorStub = {
  default: stub().returns({
    validate: validatSetNewAcknowledgeTimeoutValidatorStub,
    getErrors: getErrorsSetNewAcknowledgeTimeoutValidatorStub,
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
const sendSMSNotificationStub = stub();
const smsServiceStub = <ISmsService>{
  sendNotification: (phoneNumber: number) => {
    return sendSMSNotificationStub(phoneNumber);
  },
};
const sendEmailNotificationStub = stub();
const emailServiceStub = <IEmailService>{
  sendNotification: (address: string) => {
    return sendEmailNotificationStub(address);
  },
};
const setTimerStub = stub();
const timerServiceStub = <ITimerService>{
  setTimer: (serviceId: string) => {
    return setTimerStub(serviceId);
  },
};
const getEscalationPolicyStub = stub();
const escalationPolicyServiceStub = <IEscalationPolicyService>{
  getEscalationPolicy: (serviceId: string) => {
    return getEscalationPolicyStub(serviceId);
  },
};

const SetNewAcknowledgeTimeoutUseCase = proxyquire(
  "../../../../src/application/useCases/SetNewAcknowledgeTimeout",
  {
    "../validator/SetNewAcknowledgedTimeoutValidator": setNewAcknowledgeTimeoutValidatorStub,
  }
).default;

const setNewAcknowledgeTimeoutUseCase: SetNewAcknowledgeTimeoutUseCaseTS = new SetNewAcknowledgeTimeoutUseCase(
  pagerRepositoryStub,
  smsServiceStub,
  emailServiceStub,
  timerServiceStub,
  escalationPolicyServiceStub
);

describe("src/application/useCases/example/setNewAcknowledgeTimeoutUseCase", async function () {
  beforeEach(function () {
    validatSetNewAcknowledgeTimeoutValidatorStub.resolves(true);
    getErrorsSetNewAcknowledgeTimeoutValidatorStub.resolves([]);
    getMonitoredServiceStub.resolves(getMonitoredServiceInputData());
    setMonitoredServiceStub.resolves();
    getEscalationPolicyStub.resolves(getEscalationPolicyInputData());
    sendEmailNotificationStub.resolves();
    sendSMSNotificationStub.resolves();
    setTimerStub.resolves();
  });

  afterEach(function () {
    validatSetNewAcknowledgeTimeoutValidatorStub.reset();
    getErrorsSetNewAcknowledgeTimeoutValidatorStub.reset();
    getMonitoredServiceStub.reset();
    setMonitoredServiceStub.reset();
    getEscalationPolicyStub.reset();
    sendEmailNotificationStub.reset();
    sendSMSNotificationStub.reset();
    setTimerStub.reset();
  });

  it("should scale to a new policy level and set a new timeout", async function () {
    await setNewAcknowledgeTimeoutUseCase.execute({
      serviceId: "test-service-id",
    });

    expect(validatSetNewAcknowledgeTimeoutValidatorStub.called).to.be.true;
    expect(getErrorsSetNewAcknowledgeTimeoutValidatorStub.called).to.be.false;
    expect(getMonitoredServiceStub.called).to.be.true;
    expect(
      setMonitoredServiceStub.calledWith({
        service_id: "test-service-id",
        acknowledged: false,
        healthy: false,
        escalation_level: 1,
      })
    ).to.be.true;
    expect(sendEmailNotificationStub.calledWith("test-address-2")).to.be.true;
    expect(sendSMSNotificationStub.calledWith(987654321)).to.be.true;
    expect(setTimerStub.calledWith("test-service-id")).to.be.true;
  });

  it("should throw a service is already healthy exception if the service is already healthy", async function () {
    getMonitoredServiceStub.resolves(
      getMonitoredServiceHealthyNoAcknowledgedInputData()
    );

    try {
      await setNewAcknowledgeTimeoutUseCase.execute({
        serviceId: "test-service-id",
      });
    } catch (error) {
      expect(error).to.be.instanceof(ServiceIsHealthyException);
      expect(validatSetNewAcknowledgeTimeoutValidatorStub.called).to.be.true;
      expect(getErrorsSetNewAcknowledgeTimeoutValidatorStub.called).to.be.false;
      expect(getMonitoredServiceStub.called).to.be.true;
      expect(setMonitoredServiceStub.called).to.be.false;
      expect(sendEmailNotificationStub.called).to.be.false;
      expect(sendSMSNotificationStub.called).to.be.false;
      expect(setTimerStub.called).to.be.false;
    }
  });

  it("should throw a service is already acknowledged exception if the service is already acknowledged", async function () {
    getMonitoredServiceStub.resolves(
      getMonitoredServiceAcknowledgedInputData()
    );

    try {
      await setNewAcknowledgeTimeoutUseCase.execute({
        serviceId: "test-service-id",
      });
    } catch (error) {
      expect(error).to.be.instanceof(ServiceIsAlreadyAcknowledgedException);
      expect(validatSetNewAcknowledgeTimeoutValidatorStub.called).to.be.true;
      expect(getErrorsSetNewAcknowledgeTimeoutValidatorStub.called).to.be.false;
      expect(getMonitoredServiceStub.called).to.be.true;
      expect(setMonitoredServiceStub.called).to.be.false;
      expect(sendEmailNotificationStub.called).to.be.false;
      expect(sendSMSNotificationStub.called).to.be.false;
      expect(setTimerStub.called).to.be.false;
    }
  });

  it("should throw a service is already acknowledged exception if the service is already acknowledged", async function () {
    getMonitoredServiceStub.resolves(
      getMonitoredServiceInputDataNoAvailableLevels()
    );

    try {
      await setNewAcknowledgeTimeoutUseCase.execute({
        serviceId: "test-service-id",
      });
    } catch (error) {
      expect(error).to.be.instanceof(ServiceDoesNotHaveMoreLevelsException);
      expect(validatSetNewAcknowledgeTimeoutValidatorStub.called).to.be.true;
      expect(getErrorsSetNewAcknowledgeTimeoutValidatorStub.called).to.be.false;
      expect(getMonitoredServiceStub.called).to.be.true;
      expect(setMonitoredServiceStub.called).to.be.false;
      expect(sendEmailNotificationStub.called).to.be.false;
      expect(sendSMSNotificationStub.called).to.be.false;
      expect(setTimerStub.called).to.be.false;
    }
  });

  it("should throw a validation error if we do not receive a service id", async function () {
    validatSetNewAcknowledgeTimeoutValidatorStub.resolves(false);
    getErrorsSetNewAcknowledgeTimeoutValidatorStub.resolves([
      { field: "serviceId", message: '"serviceid" must be a string' },
    ]);

    try {
      await setNewAcknowledgeTimeoutUseCase.execute({
        serviceId: 123,
      });
    } catch (error) {
      expect(error).to.be.instanceof(ValidationException);
      expect(validatSetNewAcknowledgeTimeoutValidatorStub.called).to.be.true;
      expect(getErrorsSetNewAcknowledgeTimeoutValidatorStub.called).to.be.true;
      expect(getMonitoredServiceStub.called).to.be.false;
      expect(setMonitoredServiceStub.called).to.be.false;
      expect(getEscalationPolicyStub.called).to.be.false;
      expect(sendEmailNotificationStub.called).to.be.false;
      expect(sendSMSNotificationStub.called).to.be.false;
      expect(setTimerStub.called).to.be.false;
    }
  });
});
