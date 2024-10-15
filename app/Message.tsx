import { useState, useEffect } from "react";

import styles from "./styles.module.css";

const Alert = ({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) => <p className={`${styles.alert} ${styles["alert-" + type]}`}>{message}</p>;

const SuccessAlert = ({ message }: { message: string }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [message]);

  if (visible) {
    return <Alert type="success" message={message} />;
  }
};

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert type="error" message={message} />
);

export const Message = ({
  message,
  type,
}: {
  message: string;
  type: string;
}) => {
  if (type === "error") return <ErrorAlert message={message} />;
  else if (type === "success") return <SuccessAlert message={message} />;
  return;
};
