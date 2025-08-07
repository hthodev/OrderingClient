import Header from "./components/shared/Header";
import Home from "./components/Home";

export default function Dashboard() {

  return (
    <div className="h-screen flex flex-col">
      <Header title="Trang Chủ" />
      <main className="flex-1 overflow-hidden">
        <Home />
      </main>
    </div>
  );
}
