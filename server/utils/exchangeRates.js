const fetch = require("node-fetch");

const getExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    console.log(` Запрос курса: ${fromCurrency} → ${toCurrency}`);

    const apiKey = process.env.FIXER_API_KEY;
    const fixerUrl = `http://data.fixer.io/api/latest?access_key=${apiKey}`;

    const response = await fetch(fixerUrl);
    const data = await response.json();

    if (!data.success) {
      console.error(" Ошибка Fixer API:", data.error);
      return null;
    }

    const rates = data.rates;
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      console.error(" Ошибка: Не найден курс валют", {
        fromCurrency,
        toCurrency,
      });
      return null;
    }

    const finalRate = rates[toCurrency] / rates[fromCurrency];

    console.log(`💱 Курс ${fromCurrency} → ${toCurrency}: ${finalRate}`);
    return parseFloat(finalRate.toFixed(6));
  } catch (error) {
    console.error(" Ошибка при получении курса валют:", error);
    return null;
  }
};

const getCryptoToFiatRate = async (fromCurrency, toCurrency, amount) => {
  const fixerApiUrl = `http://data.fixer.io/api/latest?access_key=${process.env.FIXER_API_KEY}`;
  const coinGeckoApiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,eur,uah`;

  try {
    const [cryptoResponse, fiatResponse] = await Promise.all([
      fetch(coinGeckoApiUrl),
      fetch(fixerApiUrl),
    ]);

    const cryptoRates = await cryptoResponse.json();
    const fiatRates = await fiatResponse.json();

    if (!cryptoRates || !fiatRates) {
      throw new Error("Ошибка загрузки курсов криптовалют и фиатных валют");
    }

    if (fromCurrency === "BTC" || toCurrency === "BTC") {
      if (fromCurrency === "BTC") {
        const rate = cryptoRates.bitcoin[toCurrency.toLowerCase()];
        if (!rate) throw new Error(`Нет данных для валюты: ${toCurrency}`);
        return parseFloat(amount) * rate;
      } else {
        const rate = cryptoRates.bitcoin[fromCurrency.toLowerCase()];
        if (!rate) throw new Error(`Нет данных для валюты: ${fromCurrency}`);
        return parseFloat(amount) / rate;
      }
    } else {
      const fromRate = fiatRates.rates[fromCurrency];
      const toRate = fiatRates.rates[toCurrency];
      const eurBaseRate = fiatRates.rates["EUR"];

      if (!fromRate || !toRate || !eurBaseRate) {
        throw new Error(
          `Ошибка: Курсы ${fromCurrency} или ${toCurrency} не найдены`
        );
      }

      const fromToEur = fromRate / eurBaseRate;
      const toToEur = toRate / eurBaseRate;
      const finalRate = toToEur / fromToEur;

      return parseFloat(amount) * finalRate;
    }
  } catch (error) {
    console.error("Ошибка при запросе курсов валют:", error);
    return null;
  }
};

module.exports = { getExchangeRate, getCryptoToFiatRate };
