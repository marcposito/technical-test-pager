import * as sinon from "sinon";
import * as proxyquire from "proxyquire";
import {
  IPagerRepository,
  ISmsService,
  IEmailService,
  ITimerService,
  IEscalationPolicyService,
} from "../../../../src/domain/ports/out";
import FlagServiceAsUnhealthyUseCaseTS from "../../../../src/application/useCases/FlagServiceAsUnhealthy";
import {
  getMonitoredServiceHealthyNoAcknowledgedInputData,
  getMonitoredServiceInputData,
} from "../../../mocks/monitoredService";
import { getEscalationPolicyInputData } from "../../../mocks/escalationPolicy";
import { expect } from "chai";
import {
  ServiceIsUnhealthyException,
  ValidationException,
} from "../../../../src/domain/exception";

const { stub } = sinon;

const validatSetMonitoredServiceAsUnhealthyValidatorStub = stub();
const getErrorsSetMonitoredServiceAsUnhealthyValidatorStub = stub();
const setMonitoredServiceAsUnhealthyValidatorStub = {
  default: stub().returns({
    validate: validatSetMonitoredServiceAsUnhealthyValidatorStub,
    getErrors: getErrorsSetMonitoredServiceAsUnhealthyValidatorStub,
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

const FlagServiceAsUnhealthyUseCase = proxyquire(
  "../../../../src/application/useCases/FlagServiceAsUnhealthy",
  {
    "../validator/SetMonitoredServiceAsUnhealthyValidator": setMonitoredServiceAsUnhealthyValidatorStub,
  }
).default;

const flagServiceAsUnhealthyUseCase: FlagServiceAsUnhealthyUseCaseTS = new FlagServiceAsUnhealthyUseCase(
  pagerRepositoryStub,
  smsServiceStub,
  emailServiceStub,
  timerServiceStub,
  escalationPolicyServiceStub
);

describe("src/application/useCases/example/FlagServiceAsUnHealthyUseCase", async function () {
  beforeEach(function () {
    validatSetMonitoredServiceAsUnhealthyValidatorStub.resolves(true);
    getErrorsSetMonitoredServiceAsUnhealthyValidatorStub.resolves([]);
    getMonitoredServiceStub.resolves(
      getMonitoredServiceHealthyNoAcknowledgedInputData()
    );
    setMonitoredServiceStub.resolves();
    getEscalationPolicyStub.resolves(getEscalationPolicyInputData());
    sendEmailNotificationStub.resolves();
    sendSMSNotificationStub.resolves();
    setTimerStub.resolves();
  });

  afterEach(function () {
    validatSetMonitoredServiceAsUnhealthyValidatorStub.reset();
    getErrorsSetMonitoredServiceAsUnhealthyValidatorStub.reset();
    getMonitoredServiceStub.reset();
    setMonitoredServiceStub.reset();
    getEscalationPolicyStub.reset();
    sendEmailNotificationStub.reset();
    sendSMSNotificationStub.reset();
    setTimerStub.reset();
  });

  it("should flag a monitored service to unhealthy", async function () {
    await flagServiceAsUnhealthyUseCase.execute({
      serviceId: "test-service-id",
    });

    expect(validatSetMonitoredServiceAsUnhealthyValidatorStub.called).to.be
      .true;
    expect(getErrorsSetMonitoredServiceAsUnhealthyValidatorStub.called).to.be
      .false;
    expect(getMonitoredServiceStub.called).to.be.true;
    expect(
      setMonitoredServiceStub.calledWith({
        service_id: "test-service-id",
        acknowledged: false,
        healthy: false,
        escalation_level: 0,
      })
    ).to.be.true;
    expect(sendEmailNotificationStub.calledWith("test-address")).to.be.true;
    expect(sendSMSNotificationStub.calledWith(123456789)).to.be.true;
    expect(setTimerStub.calledWith("test-service-id")).to.be.true;
  });

  it("should throw a service is already unhealthy expection if the service is already unhealthy", async function () {
    getMonitoredServiceStub.resolves(getMonitoredServiceInputData());

    try {
      await flagServiceAsUnhealthyUseCase.execute({
        serviceId: "test-service-id",
      });
    } catch (error) {
      expect(error).to.be.instanceof(ServiceIsUnhealthyException);
      expect(validatSetMonitoredServiceAsUnhealthyValidatorStub.called).to.be
        .true;
      expect(getErrorsSetMonitoredServiceAsUnhealthyValidatorStub.called).to.be
        .false;
      expect(getMonitoredServiceStub.called).to.be.true;
      expect(setMonitoredServiceStub.called).to.be.false;
      expect(sendEmailNotificationStub.called).to.be.false;
      expect(sendSMSNotificationStub.called).to.be.false;
      expect(setTimerStub.called).to.be.false;
    }
  });

  it("should throw a validation error if we do not receive a service id", async function () {
    validatSetMonitoredServiceAsUnhealthyValidatorStub.resolves(false);
    getErrorsSetMonitoredServiceAsUnhealthyValidatorStub.resolves([
      { field: "serviceId", message: '"serviceid" must be a string' },
    ]);

    try {
      await flagServiceAsUnhealthyUseCase.execute({
        serviceId: 123,
      });
    } catch (error) {
      expect(error).to.be.instanceof(ValidationException);
      expect(validatSetMonitoredServiceAsUnhealthyValidatorStub.called).to.be
        .true;
      expect(getErrorsSetMonitoredServiceAsUnhealthyValidatorStub.called).to.be
        .true;
      expect(getMonitoredServiceStub.called).to.be.false;
      expect(setMonitoredServiceStub.called).to.be.false;
      expect(getEscalationPolicyStub.called).to.be.false;
      expect(sendEmailNotificationStub.called).to.be.false;
      expect(sendSMSNotificationStub.called).to.be.false;
      expect(setTimerStub.called).to.be.false;
    }
  });
});
