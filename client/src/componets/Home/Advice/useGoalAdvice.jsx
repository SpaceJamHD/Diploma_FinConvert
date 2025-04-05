import useAdviceProgress from "./useAdviceProgress";
import useAdviceTopUps from "./useAdviceTopUps";
import useAdviceSpending from "./useAdviceSpending";
import useAdviceAutoTopUp from "./useAdviceAutoTopUp";
import useAdviceCurrency from "./useAdviceCurrency";
import useAdviceDeadline from "./useAdviceDeadline";

const useGoalAdvice = async (
  goal,
  transactions = [],
  balances = {},
  autoPlans = []
) => {
  return {
    progress: useAdviceProgress(goal, transactions),
    topup: useAdviceTopUps(goal, transactions, balances),
    spending: useAdviceSpending(goal, transactions),
    currency: useAdviceCurrency(goal, transactions),
    deadline: useAdviceDeadline(goal, transactions),
    auto: await useAdviceAutoTopUp(goal, autoPlans),
  };
};

export default useGoalAdvice;
