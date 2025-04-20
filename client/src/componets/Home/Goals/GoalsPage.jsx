import React, { useEffect, useState } from "react";
import Goals from "./Goals";
import BalanceSection from "../Balance/BalanceSection";
import axiosInstance from "../../../utils/axiosInstance";

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Токена відсутня. Будь ласка, увійдіть до системи.");
        setIsLoading(false);
        return;
      }

      const { data: goalsData } = await axiosInstance.get("/api/goals");
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
