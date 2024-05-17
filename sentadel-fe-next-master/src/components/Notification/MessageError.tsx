import React from "react";

export interface MessageToastProps {
  closeToast?: any;
  toastProps?: any;
  msg: string;
}

function MessageError(props: MessageToastProps) {
  const { closeToast, toastProps, msg } = props;
  return (
    <div className="notif-messagge">
      <h6>Gagal</h6>
      <p>{msg}</p>
    </div>
  );
}

export default MessageError;
