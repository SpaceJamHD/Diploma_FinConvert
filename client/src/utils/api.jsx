import axiosInstance from "./axiosInstance";

export const fetchConvertedAmount = async (
  fromCurrency,
  toCurrency,
  amount
) => {
  try {
    const response = await axiosInstance.get(
      `/api/exchange-rates?from=${fromCurrency}&to=${toCurrency}`
    );
    const rate = parseFloat(response.data.rate);
    if (!rate || isNaN(rate) || rate <= 0) return amount;
    return parseFloat((parseFloat(amount) * rate).toFixed(6));
  } catch (error) {
    console.error("Ошибка конвертации:", error);
    return amount;
  }
};

export const withdrawFromGoal = async (goalId, amount) => {
  try {
    const response = await axiosInstance.post(`/api/goals/${goalId}/withdraw`, {
      amount,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при возврате средств:", error);
    throw error;
  }
};

export const fetchTransactions = async () => {
  try {
    const response = await axiosInstance.get("/api/transactions");
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки транзакций:", error);
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
    const response = await axiosInstance.post("/api/transactions", {
      amount,
      fromCurrency,
      toCurrency,
      type,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при создании транзакции:", error);
    throw error;
  }
};

export const withdrawFullGoalBalance = async (goalId) => {
  try {
    const response = await axiosInstance.post(
      `/api/goals/${goalId}/withdraw-full`
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при снятии всех средств:", error);
    throw error;
  }
};

export const fetchTransactionsHistory = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get(
      `/api/transactions/history?start=${startDate}&end=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки истории транзакций:", error);
    return [];
  }
};

export const fetchGoalsHistory = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get(
      `/api/goals/history?start=${startDate}&end=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки истории целей:", error);
    return [];
  }
};

export const repeatGoal = async (goalId, deadline) => {
  const response = await fetch(`/api/goals/repeat/${goalId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ deadline }),
  });

  if (!response.ok) {
    throw new Error("Не удалось повторити ціль");
  }

  return await response.json();
};

export const getExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    const response = await axiosInstance.get(
      `/api/exchange-rates?from=${fromCurrency}&to=${toCurrency}`
    );
    return parseFloat(response.data.rate);
  } catch (error) {
    console.error("Ошибка получения курса:", error);
    return null;
  }
};

export const fetchConversionDirections = async (range = "month") => {
  try {
    const response = await axiosInstance.get(
      `/api/analytics/conversion-directions?range=${range}`
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка аналитики направлений:", error);
    return [];
  }
};

export const fetchAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/users");
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки пользователей:", error);
    return [];
  }
};

export const deleteUserById = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Ошибка удаления пользователя:", error);
    throw error;
  }
};

export const banUserById = async (id, durationMinutes, reason) => {
  try {
    const response = await axiosInstance.post(`/api/admin/users/${id}/ban`, {
      durationMinutes,
      reason,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при бане пользователя:", error);
    throw error;
  }
};

export const fetchSuspiciousUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/suspicious-users");
    return response.data;
  } catch (error) {
    console.error("Ошибка получения подозрительных пользователей:", error);
    return [];
  }
};
