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

  const fetchExchangeRates = async () => {
    const fixerApiKey = "3f609958fc80bfb57e5ea48ee29bac73";
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
          usdToUah: (rates.UAH / rates.USD).toFixed(2),
          eurToUah: rates.UAH.toFixed(2),
          nokToUah: (rates.UAH / rates.NOK).toFixed(2),
          btcToUah: coinGeckoData.bitcoin?.uah.toFixed(2) || "N/A",
          ethToUah: coinGeckoData.ethereum?.uah.toFixed(2) || "N/A",
          updateTime: `Оновлено: ${new Date().toLocaleString()}`,
        };

        // Сохранение данных в localStorage
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

    if (lastUpdate && cachedRates) {
      const timeDiff = Date.now() - parseInt(lastUpdate, 10);

      // Если прошло менее 24 часов, используем кэшированные данные
      if (timeDiff < 24 * 60 * 60 * 1000) {
        setExchangeRates(JSON.parse(cachedRates));
        return;
      }
    }

    // Если прошло больше 24 часов, обновляем данные
    fetchExchangeRates();
  }, []);

  return exchangeRates;
};

export default useExchangeRates;