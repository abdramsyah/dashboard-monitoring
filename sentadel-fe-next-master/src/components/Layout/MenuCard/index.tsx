import React from "react";
import Image from "next/image";
import { ModuleType } from "@/types/auth";

interface MenuCardProps {
  module: ModuleType;
  pathUrl: string;
  onClick: () => void;
}

const MenuCard: React.FC<MenuCardProps> = (props: MenuCardProps) => {
  const {
    module: { module_description, module_path, module_icon },
    pathUrl,
    onClick,
  } = props;

  // if (notShow) {
  //   return null;
  // }

  const removeSlash = (text?: string) => text?.replace(/([/])+/, "");
  const isActive = pathUrl === removeSlash(module_path);

  return (
    <div
      className={`nav-link ${isActive ? "active" : ""}`}
      onClick={() => {
        if (!isActive) {
          onClick();
        }
      }}
    >
      {module_icon && (
        <Image priority className="icon" src={module_icon} alt="menu-icon" />
      )}
      <div className="name">{module_description}</div>
    </div>
  );
};

export default MenuCard;
