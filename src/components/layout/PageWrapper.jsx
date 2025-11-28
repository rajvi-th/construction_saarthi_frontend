import { Outlet } from "react-router-dom";

const PageWrapper = () => {
  return (
    <div className="p-6 bg-[#F9FAFB]">
      <Outlet />
    </div>
  );
};

export default PageWrapper;
