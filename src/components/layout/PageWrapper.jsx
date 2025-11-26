import { Outlet } from "react-router-dom";

const PageWrapper = () => {
  return (
    <div className="p-6 bg-gray-50">
      <Outlet />
    </div>
  );
};

export default PageWrapper;
