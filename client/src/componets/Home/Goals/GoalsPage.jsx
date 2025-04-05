import React, { useEffect, useState } from "react";
import Goals from "./Goals";
import BalanceSection from "../Balance/BalanceSection";

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Токен отсутствует. Пожалуйста, войдите в систему.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/goals", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка при загрузке данных");
      }

      const goalsData = await response.json();
      setGoals(goalsData);
    } catch (error) {
      console.error("Ошибка при загрузке целей:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <section className="container">
      <BalanceSection />

      <Goals goals={goals} setGoals={setGoals} fetchGoals={fetchGoals} />
    </section>
  );
};

export default GoalsPage;
