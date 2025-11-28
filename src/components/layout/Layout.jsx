import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import PageWrapper from "./PageWrapper";

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 w-full lg:ml-[300px]">
        <Navbar />

        <div className="pt-16">
          <PageWrapper />
        </div>
      </div>
    </div>
  );
};

export default Layout;
