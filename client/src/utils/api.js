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
