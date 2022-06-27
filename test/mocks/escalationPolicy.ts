import EscalationPolicyDTO from "../../src/application/dto/EscalationPolicyDTO";

export const getEscalationPolicyInputData = (): EscalationPolicyDTO => {
  return {
    id: "test-id",
    service_id: "test-service-id",
    levels: [
      {
        targets: [
          {
            channel: {
              address: "test-address",
            },
          },
          {
            channel: {
              phoneNumber: 123456789,
            },
          },
        ],
      },
      {
        targets: [
          {
            channel: {
              address: "test-address-2",
            },
          },
          {
            channel: {
              phoneNumber: 987654321,
            },
          },
        ],
      },
    ],
  };
};
