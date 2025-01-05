const fetch = require("node-fetch");

const getExchangeRate = async (fromCurrency, toCurrency) => {
  const apiKey = process.env.FIXER_API_KEY;
  const url = `http://data.fixer.io/api/latest?access_key=${apiKey}&symbols=${fromCurrency},${toCurrency}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.success) {
      throw new Error("Ошибка API Fixer");
    }

    const fromRate = data.rates[fromCurrency];
    const toRate = data.rates[toCurrency];

    if (!fromRate || !toRate) {
      throw new Error("Не удалось найти курс валют");
    }

    return toRate / fromRate;
  } catch (error) {
    console.error("Ошибка получения курса валют:", error);
    throw error;
  }
};

const getCryptoToFiatRate = async (fromCurrency, toCurrency, amount) => {
  const coinGeckoApiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,uah`;
  const fixerApiUrl = `http://data.fixer.io/api/latest?access_key=${process.env.FIXER_API_KEY}&symbols=USD,EUR,UAH`;

  try {
    let cryptoRates, fiatRates;

    // Получаем курсы для криптовалют и фиатных валют
    const [cryptoResponse, fiatResponse] = await Promise.all([
      fetch(coinGeckoApiUrl),
      fetch(fixerApiUrl),
    ]);

    cryptoRates = await cryptoResponse.json();
    fiatRates = await fiatResponse.json();

    console.log("Данные от CoinGecko:", cryptoRates);
    console.log("Данные от Fixer:", fiatRates);

    if (fromCurrency === "BTC" || toCurrency === "BTC") {
      // Работа с криптовалютами
      if (fromCurrency === "BTC") {
        const rate = cryptoRates.bitcoin[toCurrency.toLowerCase()];
        if (!rate) throw new Error(`Нет данных для валюты: ${toCurrency}`);
        return parseFloat(amount) * rate;
      } else if (toCurrency === "BTC") {
        const rate = cryptoRates.bitcoin[fromCurrency.toLowerCase()];
        if (!rate) throw new Error(`Нет данных для валюты: ${fromCurrency}`);
        return parseFloat(amount) / rate;
      }
    } else {
      // Работа с фиатными валютами через Fixer
      const fromRate = fiatRates.rates[fromCurrency];
      const toRate = fiatRates.rates[toCurrency];

      if (!fromRate || !toRate) {
        throw new Error(
          `Нет данных для фиатных валют: ${fromCurrency} или ${toCurrency}`
        );
      }

      const conversionRate = toRate / fromRate;
      return parseFloat(amount) * conversionRate;
    }
  } catch (error) {
    console.error("Ошибка при запросе курсов валют:", error);
    throw error;
  }
};

module.exports = { getExchangeRate, getCryptoToFiatRate };
