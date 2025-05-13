import React, { Suspense, lazy } from "react";

const AdminStats = lazy(() => import("./AdminStats"));
const TopSpenders = lazy(() => import("./TopSpenders"));
const AdminUsersTable = lazy(() => import("./AdminUsersTable"));
const SuspiciousUsersTable = lazy(() => import("./SuspiciousUsersTable"));

const AdminPage = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-light mb-4">Панель адміністратора</h1>

      <div
        className="d-flex flex-wrap gap-4 mb-4"
        style={{ justifyContent: "space-between" }}
      >
        <div style={{ flex: "1 1 48%" }}>
          <Suspense
            fallback={<p className="text-light">Завантаження статистики...</p>}
          >
            <AdminStats />
          </Suspense>
        </div>

        <div style={{ flex: "1 1 48%" }}>
          <Suspense
            fallback={
              <p className="text-light">Завантаження топ-витратників...</p>
            }
          >
            <TopSpenders />
          </Suspense>
        </div>
      </div>

      <Suspense
        fallback={<p className="text-light">Завантаження користувачів...</p>}
      >
        <AdminUsersTable />
      </Suspense>

      <Suspense
        fallback={<p className="text-light">Завантаження підозрілих дій...</p>}
      >
        <SuspiciousUsersTable />
      </Suspense>
    </div>
  );
};

export default AdminPage;
