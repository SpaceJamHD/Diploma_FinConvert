export const fetchConvertedAmount = async (
  fromCurrency,
  toCurrency,
  amount
) => {
  try {
    const response = await fetch(
      `/api/crypto-convert?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&amount=${encodeURIComponent(
        amount
      )}`
    );

    if (!response.ok) {
      throw new Error("Ошибка при запросе конвертации");
    }

    const data = await response.json();
    console.log("Результат конвертации:", data);
    return data.convertedAmount;
  } catch (error) {
    console.error("Ошибка при запросе конвертации:", error);
    throw error;
  }
};

export const withdrawFromGoal = async (goalId, amount) => {
  try {
    const response = await fetch(`/api/goals/${goalId}/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error("Ошибка при снятии средств");
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при снятии средств:", error);
    throw error;
  }
};
