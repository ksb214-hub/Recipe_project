// src/layout/Layout.js
import Header from "../components/Header/Header";

function Layout({ children }) {
  return (
    <>
      <Header />
      <main style={{ marginTop: "60px" }}>
        {children}
      </main>
    </>
  );
}

export default Layout;