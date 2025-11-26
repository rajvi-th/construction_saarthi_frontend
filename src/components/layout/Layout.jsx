import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import PageWrapper from "./PageWrapper";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 w-full md:ml-[300px]">
        <Navbar />

        <div className="pt-16">
          <PageWrapper />
        </div>
      </div>
    </div>
  );
};

export default Layout;
