import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

// Icons
import { Globe, ChevronDown } from "lucide-react";
import Breadcrumbs from "../../assets/icons/breadcrumbs.svg";

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState({
    name: "Admin's Workspace",
    email: "admin@example.com",
    initials: "AD",
    avatar: "",
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const name = `${parsed?.firstName || ""} ${parsed?.lastName || ""}`.trim() ||
          "Admin's Workspace";
        const email = parsed?.email || "admin@example.com";
        const initials =
          `${(parsed?.firstName || "A").charAt(0)}${(parsed?.lastName || "D").charAt(0)}`.toUpperCase();
        const avatar =
          parsed?.avatar ||
          parsed?.profilePicture ||
          parsed?.profile_image ||
          parsed?.photoUrl ||
          "";
        setUser({ name, email, initials, avatar });
      }
    } catch (error) {
      console.error("Unable to parse user data", error);
    }
  }, []);

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return ["Dashboard"];

    return segments.map((segment) => segment.replace(/-/g, " "));
  }, [location.pathname]);

  return (
    <header className="
      fixed top-0 left-0 right-0 
      md:left-[300px]
      h-16 
      px-4 md:px-8 
      bg-white 
      border-b border-gray-100 
      z-40 
      flex items-center justify-between
    ">
      {/* LEFT – BREADCRUMBS */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <img src={Breadcrumbs} alt="Breadcrumbs" className="w-5 h-5 flex-shrink-0" />

        <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500 min-w-0">
          {breadcrumbs.map((crumb, index) => (
            <span
              key={index}
              className="flex items-center gap-2 capitalize whitespace-nowrap text-ellipsis overflow-hidden ml-4 md:ml-0"
            >
              {index > 0 && <span className="text-gray-300">/</span>}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? "text-gray-900 font-medium truncate"
                    : "text-gray-400 truncate"
                }
              >
                {crumb}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
        
        {/* Language Button */}
        <button className="
          flex items-center gap-2 border border-gray-200 rounded-full 
          px-3 py-1.5 sm:px-4 sm:py-2 
          text-xs sm:text-sm text-gray-700
          whitespace-nowrap
        ">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">English</span>
          <span className="sm:hidden">EN</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {/* USER PROFILE */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="
              w-9 h-9 sm:w-10 sm:h-10 
              rounded-full bg-gray-100 border border-gray-200 
              flex items-center justify-center 
              text-xs sm:text-sm font-semibold text-gray-600
            ">
              {user.initials}
            </div>
          )}

          {/* USER NAME + EMAIL (hidden on mobile) */}
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
              {user.name}
            </span>
            <span className="text-xs text-gray-500 truncate max-w-[140px]">
              {user.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
