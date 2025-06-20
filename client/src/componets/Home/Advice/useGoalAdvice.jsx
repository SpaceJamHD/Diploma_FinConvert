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
  autoPlans = [],
  timeFrame = "half-year"
) => {
  const progressTips = useAdviceProgress(goal, transactions, timeFrame);
  const topUpTips = useAdviceTopUps(goal, transactions, balances, timeFrame);
  const spendingTips = useAdviceSpending(goal, transactions, timeFrame);
  const currencyTips = useAdviceCurrency(goal, transactions, timeFrame);
  const deadlineTips = useAdviceDeadline(goal, transactions, timeFrame);
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
