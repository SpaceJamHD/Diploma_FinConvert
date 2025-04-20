import React, { useEffect, useState } from "react";
import "../../../styles/HomePage.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import "../../../styles/bootstrap/js/bootstrap.bundle.min.js";
import QuickGoals from "../Goals/QuickGoals.jsx";
import "bootstrap-icons/font/bootstrap-icons.css";
import useUserRole from "../../../hooks/useUserRole.jsx";
import BalanceSection from "../Balance/BalanceSection.jsx";
import VisitChart from "../../Charts/VisitChart.jsx";

const HomePage = () => {
  const [showPastTransactions, setShowPastTransactions] = useState(false);
  const [visitData, setVisitData] = useState([]);
  const role = useUserRole();

  useEffect(() => {
    const fetchVisits = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/visits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setVisitData(data);
    };

    fetchVisits();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !role) return;

    fetch("/api/users/visit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page: "home" }),
    }).then((res) => {
      if (!res.ok) {
        console.error("Не удалось зафиксировать визит");
      }
    });
  }, [role]);

  useEffect(() => {
    class TxtRotate {
      constructor(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = "";
        this.isDeleting = false;
        this.tick();
      }

      tick() {
        const i = this.loopNum % this.toRotate.length;
        const fullTxt = this.toRotate[i];

        this.txt = this.isDeleting
          ? fullTxt.substring(0, this.txt.length - 1)
          : fullTxt.substring(0, this.txt.length + 1);

        this.el.innerHTML = `<span class="wrap">${this.txt}</span>`;

        let delta = 300 - Math.random() * 100;
        if (this.isDeleting) delta /= 2;
        if (!this.isDeleting && this.txt === fullTxt) {
          delta = this.period;
          this.isDeleting = true;
        } else if (this.isDeleting && this.txt === "") {
          this.isDeleting = false;
          this.loopNum++;
          delta = 500;
        }

        setTimeout(() => this.tick(), delta);
      }
    }

    const elements = document.getElementsByClassName("txt-rotate");
    for (let i = 0; i < elements.length; i++) {
      const toRotate = elements[i].getAttribute("data-rotate");
      const period = elements[i].getAttribute("data-period");
      if (toRotate) {
        new TxtRotate(elements[i], JSON.parse(toRotate), period);
      }
    }

    const css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = ".txt-rotate > .wrap { border-right: 0.08em solid #666 }";
    document.body.appendChild(css);
  }, []);

  return (
    <main>
      <section className="container">
        <QuickGoals />
      </section>

      <section className="container">
        <BalanceSection />
      </section>

      <section className="container">
        <VisitChart data={visitData} />
      </section>
    </main>
  );
};

export default HomePage;
