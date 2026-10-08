import { useEffect, useState } from "react";

import axios from "axios";

import { API_URL } from "../config";

import { useNavigate } from "react-router-dom";

import socket from "../socket";



function ServiceHistory() {

  const navigate = useNavigate();



  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);



  const token = localStorage.getItem("token");



  const fetchRequests = async () => {

    try {

      setLoading(true);



      const response = await axios.get(

        `${API_URL}/service-requests`,

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



      setRequests(

        response.data.requests || []

      );

    } catch (error) {

      console.error(

        "Failed to fetch service history:",

        error

      );



      if (

        error.response?.status === 401

      ) {

        localStorage.removeItem("token");

        localStorage.removeItem("user");



        navigate("/");

        return;

      }



      alert(

        error.response?.data?.message ||

          "Failed to load service history."

      );

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    if (!token) {

      navigate("/");

      return;

    }



    fetchRequests();

  }, [token, navigate]);



  // Listen for real-time service request
  // updates from the backend.

  useEffect(() => {

    if (!token) {

      return;

    }



    const handleServiceRequestUpdated =

      (updatedRequest) => {

        if (!updatedRequest?._id) {

          return;

        }



        setRequests(

          (previousRequests) => {

            const requestExists =

              previousRequests.some(

                (request) =>

                  request._id ===

                  updatedRequest._id

              );



            if (!requestExists) {

              return previousRequests;

            }



            return previousRequests.map(

              (request) =>

                request._id ===

                updatedRequest._id

                  ? {

                      ...request,

                      ...updatedRequest

                    }

                  : request

            );

          }

        );

      };



    socket.on(

      "serviceRequestUpdated",

      handleServiceRequestUpdated

    );



    return () => {

      socket.off(

        "serviceRequestUpdated",

        handleServiceRequestUpdated

      );

    };

  }, [token]);



  // Join Socket.IO rooms for all customer
  // service requests.

  useEffect(() => {

    if (

      !requests ||

      requests.length === 0

    ) {

      return;

    }



    requests.forEach(

      (request) => {

        if (request?._id) {

          socket.emit(

            "joinServiceRequest",

            request._id

          );

        }

      }

    );

  }, [requests]);



  const cancelRequest = async (

    requestId

  ) => {

    const confirmed =

      window.confirm(

        "Are you sure you want to cancel this service request?"

      );



    if (!confirmed) {

      return;

    }



    try {

      const response =

        await axios.put(

          `${API_URL}/service-requests/${requestId}/cancel`,

          {},

          {

            headers: {

              Authorization:

                `Bearer ${token}`

            }

          }

        );



      alert(

        response.data.message ||

          "Service request cancelled successfully."

      );



      await fetchRequests();

    } catch (error) {

      alert(

        error.response?.data?.message ||

          "Failed to cancel service request."

      );

    }

  };



  const getStatusInfo = (

    status

  ) => {

    const statusMap = {

      requested: {

        label: "Requested",

        background: "#fef3c7",

        color: "#92400e"

      },



      accepted: {

        label: "Mechanic Accepted",

        background: "#dbeafe",

        color: "#1d4ed8"

      },



      on_the_way: {

        label: "Mechanic On the Way",

        background: "#e0e7ff",

        color: "#4338ca"

      },



      arrived: {

        label: "Mechanic Arrived",

        background: "#ede9fe",

        color: "#6d28d9"

      },



      in_progress: {

        label: "Service In Progress",

        background: "#cffafe",

        color: "#0e7490"

      },



      completed: {

        label: "Completed",

        background: "#dcfce7",

        color: "#166534"

      },



      cancelled: {

        label: "Cancelled",

        background: "#fee2e2",

        color: "#b91c1c"

      }

    };



    return (

      statusMap[status] || {

        label: status,

        background: "#f1f5f9",

        color: "#475569"

      }

    );

  };



  const canCancel = (

    status

  ) => {

    return (

      status === "requested" ||

      status === "accepted"

    );

  };



  const formatDate = (

    date

  ) => {

    if (!date) {

      return "N/A";

    }



    return new Date(

      date

    ).toLocaleString("en-IN", {

      dateStyle: "medium",

      timeStyle: "short"

    });

  };



  if (loading) {

    return (

      <div style={styles.loadingPage}>

        <div style={styles.loadingCard}>

          <div style={styles.loadingIcon}>

            📋

          </div>



          <h2>

            Loading Service History...

          </h2>



          <p>

            Please wait while we retrieve

            your service requests.

          </p>

        </div>

      </div>

    );

  }



  return (

    <div style={styles.page}>

      {/* Header */}



      <header style={styles.header}>

        <div>

          <div style={styles.brand}>

            🚗 Roadside Assist

          </div>



          <div

            style={

              styles.headerSubtitle

            }

          >

            Service History

          </div>

        </div>



        <div style={styles.headerActions}>

          <button

            onClick={() =>

              navigate("/dashboard")

            }

            style={

              styles.secondaryButton

            }

          >

            ← Dashboard

          </button>



          <button

            onClick={() =>

              navigate(

                "/request-assistance"

              )

            }

            style={

              styles.primaryButton

            }

          >

            + New Request

          </button>

        </div>

      </header>



      <main style={styles.container}>

        {/* Page heading */}



        <section style={styles.hero}>

          <div>

            <p style={styles.eyebrow}>

              SERVICE RECORDS

            </p>



            <h1 style={styles.title}>

              Your Service History

            </h1>



            <p style={styles.subtitle}>

              Track your roadside assistance

              requests, assigned mechanics,

              service progress and completed

              services.

            </p>

          </div>



          <button

            onClick={fetchRequests}

            style={

              styles.refreshButton

            }

          >

            ↻ Refresh

          </button>

        </section>



        {/* Live update indicator */}



        <div

          style={

            styles.liveUpdateBanner

          }

        >

          <span

            style={

              styles.liveUpdateDot

            }

          />



          <span>

            Live updates enabled — service

            status changes will appear

            automatically.

          </span>

        </div>



        {/* Empty state */}



        {requests.length === 0 ? (

          <section

            style={styles.emptyCard}

          >

            <div

              style={styles.emptyIcon}

            >

              📭

            </div>



            <h2>

              No Service Requests Yet

            </h2>



            <p>

              You haven't created any

              roadside assistance requests.

            </p>



            <button

              onClick={() =>

                navigate(

                  "/request-assistance"

                )

              }

              style={

                styles.primaryButton

              }

            >

              Request Assistance

            </button>

          </section>

        ) : (

          <section

            style={

              styles.requestList

            }

          >

            {requests.map(

              (request) => {

                const status =

                  getStatusInfo(

                    request.status

                  );



                return (

                  <article

                    key={

                      request._id

                    }

                    style={

                      styles.requestCard

                    }

                  >

                    {/* Request header */}



                    <div

                      style={

                        styles.cardHeader

                      }

                    >

                      <div>

                        <span

                          style={

                            styles.serviceType

                          }

                        >

                          {

                            request.serviceType

                          }

                        </span>



                        <h2

                          style={

                            styles.vehicleTitle

                          }

                        >

                          {request.vehicle

                            ?.make ||

                            "Vehicle"}{" "}

                          {request.vehicle

                            ?.model ||

                            ""}

                        </h2>



                        <p

                          style={

                            styles.registration

                          }

                        >

                          Registration:{" "}

                          {request

                            .vehicle

                            ?.registrationNumber ||

                            "N/A"}

                        </p>

                      </div>



                      <span

                        style={{

                          ...styles.statusBadge,

                          background:

                            status.background,

                          color:

                            status.color

                        }}

                      >

                        {status.label}

                      </span>

                    </div>



                    {/* Request details */}



                    <div

                      style={

                        styles.detailsGrid

                      }

                    >

                      <div

                        style={

                          styles.detailItem

                        }

                      >

                        <span

                          style={

                            styles.detailLabel

                          }

                        >

                          REQUESTED ON

                        </span>



                        <strong>

                          {formatDate(

                            request.createdAt

                          )}

                        </strong>

                      </div>



                      <div

                        style={

                          styles.detailItem

                        }

                      >

                        <span

                          style={

                            styles.detailLabel

                          }

                        >

                          LOCATION

                        </span>



                        <strong>

                          {request

                            .location

                            ?.address ||

                            "Location provided"}

                        </strong>

                      </div>



                      <div

                        style={

                          styles.detailItem

                        }

                      >

                        <span

                          style={

                            styles.detailLabel

                          }

                        >

                          ESTIMATED COST

                        </span>



                        <strong>

                          ₹

                          {Number(

                            request

                              .estimatedCost ||

                              0

                          ).toLocaleString(

                            "en-IN"

                          )}

                        </strong>

                      </div>



                      <div

                        style={

                          styles.detailItem

                        }

                      >

                        <span

                          style={

                            styles.detailLabel

                          }

                        >

                          REQUEST ID

                        </span>



                        <strong

                          style={

                            styles.requestId

                          }

                        >

                          {request._id}

                        </strong>

                      </div>

                    </div>



                    {/* Description */}



                    {request.description && (

                      <div

                        style={

                          styles.descriptionBox

                        }

                      >

                        <span

                          style={

                            styles.detailLabel

                          }

                        >

                          PROBLEM DESCRIPTION

                        </span>



                        <p

                          style={

                            styles.descriptionText

                          }

                        >

                          {

                            request.description

                          }

                        </p>

                      </div>

                    )}



                    {/* Partner information */}



                    {request.partner && (

                      <div

                        style={

                          styles.partnerBox

                        }

                      >

                        <div

                          style={

                            styles.partnerIcon

                          }

                        >

                          🔧

                        </div>



                        <div

                          style={

                            styles.partnerInfo

                          }

                        >

                          <span

                            style={

                              styles.detailLabel

                            }

                          >

                            ASSIGNED SERVICE

                            PARTNER

                          </span>



                          <strong>

                            {

                              request

                                .partner

                                .businessName

                            }

                          </strong>



                          <span>

                            📞{" "}

                            {request

                              .partner

                              .phone ||

                              "Phone not available"}

                          </span>



                          <span>

                            ⭐{" "}

                            {Number(

                              request

                                .partner

                                .rating ||

                                5

                            ).toFixed(1)}

                          </span>

                        </div>

                      </div>

                    )}



                    {/* Feedback */}



                    {request.feedback && (

                      <div

                        style={

                          styles.feedbackBox

                        }

                      >

                        <span

                          style={

                            styles.detailLabel

                          }

                        >

                          YOUR FEEDBACK

                        </span>



                        <p

                          style={

                            styles.feedbackText

                          }

                        >

                          {

                            request.feedback

                          }

                        </p>



                        {request.rating && (

                          <div

                            style={

                              styles.rating

                            }

                          >

                            {"★".repeat(

                              request.rating

                            )}



                            {"☆".repeat(

                              5 -

                                request.rating

                            )}

                          </div>

                        )}

                      </div>

                    )}



                    {/* Actions */}



                    <div

                      style={

                        styles.actions

                      }

                    >

                      {[

                        "accepted",

                        "on_the_way",

                        "arrived",

                        "in_progress"

                      ].includes(

                        request.status

                      ) && (

                        <button

                          onClick={() =>

                            navigate(

                              "/live-tracking"

                            )

                          }

                          style={

                            styles.trackButton

                          }

                        >

                          📍 Live Tracking

                        </button>

                      )}



                      {canCancel(

                        request.status

                      ) && (

                        <button

                          onClick={() =>

                            cancelRequest(

                              request._id

                            )

                          }

                          style={

                            styles.cancelButton

                          }

                        >

                          ✕ Cancel Request

                        </button>

                      )}



                      {request.status ===

                        "completed" &&

                        !request.rating && (

                          <button

                            onClick={() =>

                              navigate(

                                "/rate-service",

                                {

                                  state: {

                                    request

                                  }

                                }

                              )

                            }

                            style={

                              styles.rateButton

                            }

                          >

                            ⭐ Rate Service

                          </button>

                        )}

                    </div>

                  </article>

                );

              }

            )}

          </section>

        )}

      </main>

    </div>

  );

}



const styles = {

  page: {

    minHeight: "100vh",

    background:

      "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",

    color: "#0f172a",

    fontFamily:

      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

  },



  header: {

    minHeight: "76px",

    padding: "16px 5%",

    background:

      "rgba(255, 255, 255, 0.96)",

    borderBottom:

      "1px solid #e2e8f0",

    display: "flex",

    justifyContent:

      "space-between",

    alignItems: "center",

    gap: "20px",

    position: "sticky",

    top: 0,

    zIndex: 20,

    boxShadow:

      "0 4px 18px rgba(15, 23, 42, 0.06)"

  },



  brand: {

    fontSize: "22px",

    fontWeight: "800",

    color: "#0f172a"

  },



  headerSubtitle: {

    fontSize: "13px",

    color: "#64748b",

    marginTop: "3px"

  },



  headerActions: {

    display: "flex",

    gap: "10px",

    alignItems: "center"

  },



  container: {

    width: "90%",

    maxWidth: "1150px",

    margin: "0 auto",

    padding:

      "35px 0 60px"

  },



  hero: {

    display: "flex",

    justifyContent:

      "space-between",

    alignItems: "flex-end",

    gap: "25px",

    marginBottom: "18px"

  },



  eyebrow: {

    margin:

      "0 0 8px",

    color: "#4f46e5",

    fontSize: "12px",

    fontWeight: "800",

    letterSpacing: "1.5px"

  },



  title: {

    margin: 0,

    fontSize:

      "clamp(30px, 4vw, 44px)",

    lineHeight: 1.1,

    fontWeight: "850"

  },



  subtitle: {

    maxWidth: "720px",

    margin:

      "14px 0 0",

    color: "#64748b",

    fontSize: "15px",

    lineHeight: 1.7

  },



  primaryButton: {

    border: "none",

    background: "#4f46e5",

    color: "#fff",

    padding:

      "11px 16px",

    borderRadius: "10px",

    fontWeight: "800",

    cursor: "pointer",

    whiteSpace: "nowrap"

  },



  secondaryButton: {

    border:

      "1px solid #cbd5e1",

    background: "#fff",

    color: "#334155",

    padding:

      "10px 15px",

    borderRadius: "10px",

    fontWeight: "800",

    cursor: "pointer",

    whiteSpace: "nowrap"

  },



  refreshButton: {

    border:

      "1px solid #cbd5e1",

    background: "#fff",

    color: "#334155",

    padding:

      "10px 15px",

    borderRadius: "10px",

    fontWeight: "800",

    cursor: "pointer",

    whiteSpace: "nowrap"

  },



  liveUpdateBanner: {

    display: "flex",

    alignItems: "center",

    gap: "9px",

    background: "#f0fdf4",

    border:

      "1px solid #bbf7d0",

    color: "#166534",

    borderRadius: "10px",

    padding:

      "10px 13px",

    marginBottom: "22px",

    fontSize: "12px",

    fontWeight: "700"

  },



  liveUpdateDot: {

    width: "8px",

    height: "8px",

    borderRadius: "50%",

    background: "#22c55e",

    display: "inline-block",

    boxShadow:

      "0 0 0 4px #dcfce7"

  },



  requestList: {

    display: "flex",

    flexDirection: "column",

    gap: "18px"

  },



  requestCard: {

    background: "#fff",

    border:

      "1px solid #e2e8f0",

    borderRadius: "20px",

    padding: "24px",

    boxShadow:

      "0 8px 25px rgba(15, 23, 42, 0.05)"

  },



  cardHeader: {

    display: "flex",

    justifyContent:

      "space-between",

    alignItems: "flex-start",

    gap: "20px",

    paddingBottom: "20px",

    borderBottom:

      "1px solid #f1f5f9"

  },



  serviceType: {

    display: "inline-block",

    background: "#eef2ff",

    color: "#4338ca",

    borderRadius: "999px",

    padding:

      "5px 10px",

    fontSize: "11px",

    fontWeight: "800"

  },



  vehicleTitle: {

    margin:

      "12px 0 3px",

    fontSize: "22px",

    fontWeight: "800"

  },



  registration: {

    margin: 0,

    color: "#64748b",

    fontSize: "13px"

  },



  statusBadge: {

    borderRadius: "999px",

    padding:

      "8px 13px",

    fontSize: "12px",

    fontWeight: "800",

    whiteSpace: "nowrap"

  },



  detailsGrid: {

    display: "grid",

    gridTemplateColumns:

      "repeat(2, 1fr)",

    gap: "18px",

    padding:

      "22px 0"

  },



  detailItem: {

    display: "flex",

    flexDirection: "column",

    gap: "5px",

    minWidth: 0

  },



  detailLabel: {

    color: "#94a3b8",

    fontSize: "10px",

    fontWeight: "800",

    letterSpacing: "1px"

  },



  requestId: {

    fontSize: "11px",

    color: "#475569",

    wordBreak: "break-all"

  },



  descriptionBox: {

    background: "#f8fafc",

    borderRadius: "12px",

    padding: "15px",

    marginBottom: "15px"

  },



  descriptionText: {

    margin:

      "7px 0 0",

    color: "#475569",

    lineHeight: 1.6,

    fontSize: "14px"

  },



  partnerBox: {

    display: "flex",

    alignItems: "center",

    gap: "15px",

    background: "#f0fdf4",

    border:

      "1px solid #bbf7d0",

    borderRadius: "14px",

    padding: "16px",

    marginBottom: "15px"

  },



  partnerIcon: {

    width: "48px",

    height: "48px",

    borderRadius: "12px",

    background: "#dcfce7",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    fontSize: "23px"

  },



  partnerInfo: {

    display: "flex",

    flexDirection: "column",

    gap: "3px",

    color: "#475569",

    fontSize: "13px"

  },



  feedbackBox: {

    background: "#fffbeb",

    border:

      "1px solid #fde68a",

    borderRadius: "14px",

    padding: "16px",

    marginBottom: "15px"

  },



  feedbackText: {

    margin:

      "7px 0",

    color: "#475569",

    fontSize: "14px"

  },



  rating: {

    color: "#f59e0b",

    fontSize: "18px",

    letterSpacing: "2px"

  },



  actions: {

    display: "flex",

    justifyContent:

      "flex-end",

    alignItems: "center",

    gap: "10px",

    flexWrap: "wrap",

    paddingTop: "5px"

  },



  trackButton: {

    border: "none",

    background: "#4f46e5",

    color: "#fff",

    padding:

      "11px 16px",

    borderRadius: "10px",

    fontWeight: "800",

    cursor: "pointer"

  },



  cancelButton: {

    border:

      "1px solid #fecaca",

    background: "#fff",

    color: "#dc2626",

    padding:

      "11px 16px",

    borderRadius: "10px",

    fontWeight: "800",

    cursor: "pointer"

  },



  rateButton: {

    border: "none",

    background: "#f59e0b",

    color: "#fff",

    padding:

      "11px 16px",

    borderRadius: "10px",

    fontWeight: "800",

    cursor: "pointer"

  },



  emptyCard: {

    background: "#fff",

    border:

      "1px solid #e2e8f0",

    borderRadius: "20px",

    padding: "55px 25px",

    textAlign: "center",

    boxShadow:

      "0 8px 25px rgba(15, 23, 42, 0.05)"

  },



  emptyIcon: {

    fontSize: "48px",

    marginBottom: "10px"

  },



  loadingPage: {

    minHeight: "100vh",

    background: "#f8fafc",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    padding: "20px"

  },



  loadingCard: {

    background: "#fff",

    border:

      "1px solid #e2e8f0",

    borderRadius: "20px",

    padding: "45px",

    textAlign: "center",

    maxWidth: "430px",

    boxShadow:

      "0 12px 30px rgba(15, 23, 42, 0.08)"

  },



  loadingIcon: {

    fontSize: "45px",

    marginBottom: "12px"

  }

};



export default ServiceHistory;