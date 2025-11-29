import { Outlet } from "react-router-dom";

const PageWrapper = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-[#F9FAFB] min-h-screen">
      <Outlet />
    </div>
  );
};

export default PageWrapper;
