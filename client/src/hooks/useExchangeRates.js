import { useState, useEffect } from "react";

const useExchangeRates = () => {
  const [exchangeRates, setExchangeRates] = useState({
    usdToUah: "Загрузка...",
    eurToUah: "Загрузка...",
    nokToUah: "Загрузка...",
    btcToUah: "Загрузка...",
    ethToUah: "Загрузка...",
    updateTime: "Загрузка...",
  });

  const spread = 0.02;

  const fetchExchangeRates = async () => {
    const fixerApiKey = "086fb203db5e404e558151a95afac80d";
    const fixerApiUrl = `http://data.fixer.io/api/latest?access_key=${fixerApiKey}&symbols=UAH,USD,EUR,NOK`;
    const coinGeckoApiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=uah`;

    try {
      const [fixerResponse, coinGeckoResponse] = await Promise.all([
        fetch(fixerApiUrl),
        fetch(coinGeckoApiUrl),
      ]);

      const fixerData = await fixerResponse.json();
      const coinGeckoData = await coinGeckoResponse.json();

      if (fixerData.success) {
        const rates = fixerData.rates;

        const newRates = {
          usdToUah: ((rates.UAH / rates.USD) * (1 + spread)).toFixed(2),
          eurToUah: (rates.UAH * (1 + spread)).toFixed(2),
          nokToUah: ((rates.UAH / rates.NOK) * (1 + spread)).toFixed(2),
          btcToUah:
            (coinGeckoData.bitcoin?.uah * (1 + spread)).toFixed(2) || "N/A",
          ethToUah:
            (coinGeckoData.ethereum?.uah * (1 + spread)).toFixed(2) || "N/A",
          updateTime: `Оновлено: ${new Date().toLocaleString()}`,
        };

        localStorage.setItem("exchangeRates", JSON.stringify(newRates));
        localStorage.setItem("lastUpdate", Date.now().toString());

        setExchangeRates(newRates);
      } else {
        console.error("Ошибка Fixer.io:", fixerData.error);
        setExchangeRates((prev) => ({
          ...prev,
          updateTime: "Не вдалося оновити курси",
        }));
      }
    } catch (error) {
      console.error("Ошибка API:", error);
      setExchangeRates((prev) => ({
        ...prev,
        updateTime: "Не вдалося підключитися до API",
      }));
    }
  };

  useEffect(() => {
    const lastUpdate = localStorage.getItem("lastUpdate");
    const cachedRates = localStorage.getItem("exchangeRates");

    const timeDiff = lastUpdate ? Date.now() - parseInt(lastUpdate, 10) : 0;
    if (timeDiff >= 24 * 60 * 60 * 1000) {
      fetchExchangeRates();
    } else {
      setExchangeRates(JSON.parse(cachedRates));
    }
  }, []);

  return exchangeRates;
};

export default useExchangeRates;
