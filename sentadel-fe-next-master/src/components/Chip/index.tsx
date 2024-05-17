import React, { ReactNode } from "react";

export type ChipTheme =
  | "outlined-red"
  | "outlined-green"
  | "outlined-blue"
  | "solid-green";

interface ChipProps {
  theme: ChipTheme;
  children: ReactNode;
  onClick?: () => void;
}

const Chip: React.FC<ChipProps> = (props: ChipProps) => {
  const { theme, children, onClick } = props;

  const selectTheme = {
    ["outlined-red"]: "chip-red-outlined",
    ["outlined-green"]: "chip-green-outlined",
    ["outlined-blue"]: "chip-blue-outlined",
    ["solid-green"]: "chip-green-solid",
  };

  const useBlock = () => {
    if (typeof children === "string" && children.match(/\s+/g)) {
      return "chip-blok";
    }
    return "";
  };

  return (
    <div
      className={`${selectTheme[theme]} ${
        onClick && "chip-touchable"
      } ${useBlock()}`}
      onClick={onClick}
    >
      <span>{children}</span>
    </div>
  );
};

export default Chip;
