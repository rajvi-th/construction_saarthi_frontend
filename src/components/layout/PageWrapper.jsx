import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

const PageWrapper = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // change to "smooth" if you prefer smooth scrolling
    });
  }, [location.pathname]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-[#F9FAFB] min-h-screen">
      <Outlet />
    </div>
  );
};

export default PageWrapper;
