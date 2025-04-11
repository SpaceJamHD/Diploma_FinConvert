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
  const progressTips = useAdviceProgress(goal, transactions);
  const topUpTips = useAdviceTopUps(goal, transactions, balances);
  const spendingTips = useAdviceSpending(goal, transactions);
  const currencyTips = useAdviceCurrency(goal, transactions);
  const deadlineTips = useAdviceDeadline(goal, transactions);
  const autoTopUpTips = await useAdviceAutoTopUp(goal, autoPlans);

  return {
    progress: progressTips,
    topup: topUpTips,
    spending: spendingTips,
    currency: currencyTips,
    deadline: deadlineTips,
    auto: autoTopUpTips,
  };
};

export default useGoalAdvice;
