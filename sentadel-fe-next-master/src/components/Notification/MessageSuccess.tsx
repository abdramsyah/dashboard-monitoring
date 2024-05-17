import React from "react";
import { MessageToastProps } from "@/components/Notification/MessageError";

function MessageSuccess(props: MessageToastProps) {
  const { closeToast, toastProps, msg } = props;
  return (
    <div className="notif-messagge">
      <h6>Success</h6>
      <p>{msg}</p>
    </div>
  );
}

export default MessageSuccess;
