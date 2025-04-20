const fetch = require("node-fetch");

const fallbackRates = {
  UAH: { USD: 0.0242, EUR: 0.0213, BTC: 0.00000028 },
  USD: { UAH: 41.32, EUR: 0.8793, BTC: 0.0000117 },
  EUR: { UAH: 47.02, USD: 1.137, BTC: 0.0000133 },
  BTC: { UAH: 3_500_000, USD: 85_200, EUR: 75_000 },
};

const getExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    console.log(`Запрос курса: ${fromCurrency} → ${toCurrency}`);

    const apiKey = process.env.FIXER_API_KEY;
    const fixerUrl = `https://data.fixer.io/api/latest?access_key=${apiKey}`;

    const response = await fetch(fixerUrl);
    const data = await response.json();

    if (!data.success) {
      console.error("Ошибка Fixer API:", data.error);
      throw new Error("Fixer API не отвечает");
    }

    const rates = data.rates;
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      console.error("Не найден курс валют:", { fromCurrency, toCurrency });
      throw new Error("Нет нужных валют в ответе Fixer");
    }

    let finalRate = rates[toCurrency] / rates[fromCurrency];

    if (!finalRate || finalRate <= 0) {
      console.error(` Некорректный курс: ${finalRate}`);
      throw new Error("Курс некорректный");
    }

    console.log(` Курс ${fromCurrency} → ${toCurrency}: ${finalRate}`);
    return parseFloat(finalRate.toFixed(8));
  } catch (error) {
    console.warn(
      `Используем fallback курс для ${fromCurrency} → ${toCurrency}`
    );

    if (
      fallbackRates[fromCurrency] &&
      fallbackRates[fromCurrency][toCurrency]
    ) {
      return fallbackRates[fromCurrency][toCurrency];
    }

    console.error(` Нет fallback курса для ${fromCurrency} → ${toCurrency}`);
    return null;
  }
};

const getCryptoToFiatRate = async (fromCurrency, toCurrency, amount) => {
  const fixerApiUrl = `https://data.fixer.io/api/latest?access_key=${process.env.FIXER_API_KEY}`;
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

    console.log("Курсы криптовалют:", cryptoRates);
    console.log(" Курсы фиата:", fiatRates);

    if (fromCurrency === "BTC") {
      const rate = cryptoRates.bitcoin[toCurrency.toLowerCase()];
      if (!rate) throw new Error(`Нет данных для валюты: ${toCurrency}`);
      return parseFloat(amount) * rate;
    } else if (toCurrency === "BTC") {
      const fiatToUsd = fiatRates.rates[fromCurrency] / fiatRates.rates["USD"];
      const btcRate = cryptoRates.bitcoin["usd"];

      if (!fiatToUsd || !btcRate) {
        throw new Error(`Нет курса для ${fromCurrency} или BTC`);
      }

      const finalRate = fiatToUsd / btcRate;
      console.log(`Конвертация ${fromCurrency} → BTC: ${finalRate}`);
      return parseFloat(amount) * finalRate;
    } else {
      const fromRate = fiatRates.rates[fromCurrency];
      const toRate = fiatRates.rates[toCurrency];
      const eurBaseRate = fiatRates.rates["EUR"];

      if (!fromRate || !toRate || !eurBaseRate) {
        throw new Error("Нет нужных курсов в Fixer");
      }

      const fromToEur = fromRate / eurBaseRate;
      const toToEur = toRate / eurBaseRate;
      const finalRate = toToEur / fromToEur;

      return parseFloat(amount) * finalRate;
    }
  } catch (error) {
    console.warn(`⚠ Ошибка API: ${error.message}`);

    if (
      fallbackRates[fromCurrency] &&
      fallbackRates[fromCurrency][toCurrency]
    ) {
      return parseFloat(amount) * fallbackRates[fromCurrency][toCurrency];
    }

    console.error(`❌ Нет fallback курса для ${fromCurrency} → ${toCurrency}`);
    return null;
  }
};

module.exports = { getExchangeRate, getCryptoToFiatRate };
