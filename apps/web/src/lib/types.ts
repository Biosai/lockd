export interface Deposit {
  id: number;
  depositor: string;
  claimant: string;
  token: string;
  amount: bigint;
  startTime: bigint;
  deadline: bigint;
  claimed: boolean;
  title: string;
}
