import React from "react";
import AdminUsersTable from "./AdminUsersTable";

const AdminPage = () => {
  return (
    <div className="container mt-5">
      <h1>Панель адміністратора</h1>
      <AdminUsersTable />
    </div>
  );
};

export default AdminPage;
