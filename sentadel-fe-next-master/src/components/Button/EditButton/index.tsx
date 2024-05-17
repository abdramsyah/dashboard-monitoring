import { EditOutlined } from "@ant-design/icons";
import React from "react";

type EditButtonProps = {
  onClick: () => void;
  size?: number;
  customColor?: {
    container?: React.CSSProperties["backgroundColor"];
    icon?: React.CSSProperties["color"];
  };
  customStyle?: {
    container?: React.CSSProperties;
    icon?: React.CSSProperties;
  };
};

const EditButton: React.FC<EditButtonProps> = (props: EditButtonProps) => {
  const { onClick, size, customColor, customStyle } = props;

  const iconSize = size || 16;

  const defaultStyle: React.CSSProperties = {
    paddingTop: iconSize * 0.15,
    paddingBottom: iconSize * 0.15,
    paddingRight: iconSize * 0.25,
    paddingLeft: iconSize * 0.25,
    backgroundColor: customColor?.container || "#58a571",
    borderRadius: (iconSize + iconSize * 0.3) * 0.2,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: iconSize,
    stroke: "#fff",
    color: customColor?.icon || "#fff",
  };

  return (
    <div style={customStyle?.container || defaultStyle}>
      <EditOutlined style={customStyle?.icon || iconStyle} onClick={onClick} />
    </div>
  );
};

export default EditButton;
