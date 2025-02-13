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
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount,
        fromCurrency,
        toCurrency,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error("Ошибка создания транзакции");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Ошибка при создании транзакции:", error);
    throw error;
  }
};
