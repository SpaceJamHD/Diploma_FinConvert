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
      return amount; // Возвращаем исходную сумму без изменений
    }

    const convertedAmount = parseFloat((parseFloat(amount) * rate).toFixed(6));

    console.log(
      `💱 ${amount} ${fromCurrency} → ${convertedAmount} ${toCurrency} (Курс: ${rate})`
    );

    console.log(
      `💱 Курс ${fromCurrency} → ${toCurrency}: ${rate}, Сумма: ${amount}, Итог: ${convertedAmount}`
    );

    console.log("🟡 КЛИЕНТСКАЯ КОНВЕРТАЦИЯ:", {
      fromCurrency,
      toCurrency,
      исходная_сумма: amount,
      курс: rate,
      итоговая_сумма: convertedAmount,
    });

    return convertedAmount; // Возвращаем уже пересчитанную сумму
  } catch (error) {
    console.error("❌ Ошибка конвертации:", error);
    return amount; // Если ошибка, возвращаем ту же сумму
  }
};

export const withdrawFromGoal = async (goalId, amount) => {
  try {
    console.log("🔹 Отправка запроса на возврат:", { goalId, amount });

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
    console.error("❌ Ошибка при возврате средств:", error);
    throw error;
  }
};

export const fetchTransactions = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/transactions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Ошибка получения транзакций");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Ошибка загрузки транзакций:", error);
    return [];
  }
};

export const createTransaction = async (
  amount,
  fromCurrency,
  toCurrency,
  type
) => {
  const token = localStorage.getItem("token");

  console.log("📡 Отправка транзакции:", {
    amount,
    fromCurrency,
    toCurrency,
    type,
  });

  const response = await fetch("http://localhost:5000/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount, fromCurrency, toCurrency, type }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(" Ошибка при создании транзакции:", data);
    throw new Error("Ошибка создания транзакции");
  }

  return data;
};

export const withdrawFullGoalBalance = async (goalId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`/api/goals/${goalId}/withdraw-full`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Ошибка при снятии всех средств");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Ошибка при снятии средств:", error);
    throw error;
  }
};

export const fetchTransactionsHistory = async (startDate, endDate) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `/api/transactions/history?start=${startDate}&end=${endDate}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Ошибка получения истории транзакций");
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка загрузки истории транзакций:", error);
    return [];
  }
};

export const fetchGoalsHistory = async (startDate, endDate) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `/api/goals/history?start=${startDate}&end=${endDate}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Ошибка получения истории целей");
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка загрузки истории целей:", error);
    return [];
  }
};

export const repeatGoal = async (goal) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("/api/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: `${goal.name} (повтор)`,
        description: goal.description,
        amount: goal.amount,
        deadline: goal.deadline,
        priority: goal.priority,
        currency: goal.currency,
      }),
    });

    if (!response.ok) {
      throw new Error("Ошибка при повторении цели");
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при повторении цели:", error);
    throw error;
  }
};

export const getExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    const response = await fetch(
      `/api/exchange-rates?from=${fromCurrency}&to=${toCurrency}`
    );
    const data = await response.json();

    if (!response.ok || !data.rate) {
      throw new Error("Помилка отримання курсу");
    }

    return parseFloat(data.rate);
  } catch (error) {
    console.error("Помилка під час запиту курсу:", error);
    return null;
  }
};
