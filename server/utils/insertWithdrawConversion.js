const pool = require("../models/userModel");
const { getExchangeRate } = require("./exchangeRates");

const insertWithdrawConversion = async ({ userId, amount, currency }) => {
  try {
    if (currency === "UAH") return;

    const rate = await getExchangeRate(currency, "UAH");

    if (!rate || rate <= 0) {
      console.error(` Курс для ${currency} → UAH не получен`);
      return;
    }

    const convertedAmount = parseFloat((amount * rate).toFixed(2));

    console.log(
      `Создание аналитической транзакции: ${amount} ${currency} → ${convertedAmount} UAH`
    );

    await pool.query(
      `INSERT INTO currency_transactions
       (user_id, amount, from_currency, to_currency, type, date, original_amount, spread_loss)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)`,
      [
        userId,
        convertedAmount,
        currency,
        "UAH",
        "withdraw-conversion",
        amount,
        0,
      ]
    );
  } catch (error) {
    console.error(" Ошибка создания аналитической withdraw-конверсии:", error);
  }
};

module.exports = insertWithdrawConversion;
