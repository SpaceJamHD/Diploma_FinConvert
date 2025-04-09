import React from "react";
import AdminUsersTable from "./AdminUsersTable";
import SuspiciousUsersTable from "./SuspiciousUsersTable";
import AdminStats from "./AdminStats";
import TopSpenders from "./TopSpenders";

const AdminPage = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-light mb-4">Панель адміністратора</h1>

      <div
        className="d-flex flex-wrap gap-4 mb-4"
        style={{ justifyContent: "space-between" }}
      >
        <div style={{ flex: "1 1 48%" }}>
          <AdminStats />
        </div>

        <div style={{ flex: "1 1 48%" }}>
          <TopSpenders />
        </div>
      </div>

      <AdminUsersTable />
      <SuspiciousUsersTable />
    </div>
  );
};

export default AdminPage;
