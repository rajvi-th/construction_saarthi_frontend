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
    <div className="p-6 bg-[#F9FAFB]">
      <Outlet />
    </div>
  );
};

export default PageWrapper;
