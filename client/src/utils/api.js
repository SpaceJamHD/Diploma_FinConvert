export const fetchConvertedAmount = async (
  fromCurrency,
  toCurrency,
  amount
) => {
  try {
    const response = await fetch(
      `/api/exchange-rates?from=${fromCurrency}&to=${toCurrency}`
    );

    if (!response.ok) {
      throw new Error("Ошибка получения курса валют");
    }

    const data = await response.json();
    const rate = parseFloat(data.rate); // Получаем курс обмена

    if (!rate || isNaN(rate) || rate <= 0) {
      console.error("❌ Ошибка: Некорректный курс обмена", rate);
      return parseFloat(amount); // Возвращаем ту же сумму, если курс неверный
    }

    console.log(
      `💱 Курс ${fromCurrency} → ${toCurrency}: ${rate}, Сумма: ${amount}, Итог: ${
        parseFloat(amount) * rate
      }`
    );

    return parseFloat(amount) * rate; // Конвертация суммы
  } catch (error) {
    console.error("❌ Ошибка конвертации:", error);
    return parseFloat(amount); // Если ошибка, возвращаем ту же сумму (чтобы не обнулять)
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
