import { useEffect, useState } from "react";
import socket from "./socket";

function SocketTest() {
  const requestId = "6ac2908ed320d88032f07bab";

  const [status, setStatus] = useState("Waiting for update...");

  useEffect(() => {
    socket.emit("joinServiceRequest", requestId);

    socket.on("serviceRequestUpdated", (request) => {
      console.log("Service request updated:", request);

      setStatus(request.status);
    });

    return () => {
      socket.off("serviceRequestUpdated");
    };
  }, []);

  return (
    <div>
      <h2>Socket.IO Connected</h2>

      <p>
        Service Request: {requestId}
      </p>

      <h3>
        Current Status: {status}
      </h3>
    </div>
  );
}

export default SocketTest;
