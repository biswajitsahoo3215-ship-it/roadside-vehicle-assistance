import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const customerServices = [
    {
      icon: "🚨",
      title: "Emergency Assistance",
      description:
        "Request immediate roadside help for your vehicle.",
      button: "Request Help",
      path: "/request-assistance",
      primary: true
    },
    {
      icon: "🚗",
      title: "My Vehicles",
      description:
        "Add, view and manage your registered vehicles.",
      button: "Manage Vehicles",
      path: "/vehicles"
    },
    {
      icon: "📋",
      title: "Service History",
      description:
        "View your current and previous assistance requests.",
      button: "View History",
      path: "/service-history"
    },
    {
      icon: "📍",
      title: "Live Tracking",
      description:
        "Track your assigned service partner in real time.",
      button: "Track Mechanic",
      path: "/live-tracking"
    }
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
        padding: "30px 20px"
      }}
    >
      <div
        style={{
          maxWidth: "1150px",
          margin: "0 auto"
        }}
      >
        {/* Header */}

        <header
          style={{
            background:
              "linear-gradient(135deg, #0f172a, #1d4ed8)",
            padding: "32px",
            borderRadius: "20px",
            marginBottom: "25px",
            boxShadow:
              "0 12px 30px rgba(15, 23, 42, 0.16)",
            color: "white"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap"
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#bfdbfe",
                  fontSize: "13px",
                  fontWeight: "700",
                  letterSpacing: "1px"
                }}
              >
                ROADSIDE ASSISTANCE PLATFORM
              </p>

              <h1
                style={{
                  color: "white",
                  margin:
                    "8px 0 8px",
                  fontSize: "32px"
                }}
              >
                Welcome back,{" "}
                {user?.name || "User"} 👋
              </h1>

              <p
                style={{
                  color: "#dbeafe",
                  margin: 0,
                  maxWidth: "650px"
                }}
              >
                Get reliable roadside assistance
                whenever your vehicle needs help.
              </p>
            </div>

            <div
              style={{
                background:
                  "rgba(255,255,255,0.1)",
                border:
                  "1px solid rgba(255,255,255,0.2)",
                padding:
                  "14px 17px",
                borderRadius:
                  "12px",
                minWidth: "160px"
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#bfdbfe",
                  fontSize: "11px",
                  fontWeight: "700"
                }}
              >
                ACCOUNT TYPE
              </p>

              <strong
                style={{
                  color: "white",
                  textTransform:
                    "capitalize",
                  fontSize: "16px"
                }}
              >
                {user?.role}
              </strong>
            </div>
          </div>
        </header>

        {/* Emergency Banner */}

        {user?.role === "user" && (
          <div
            style={{
              background:
                "linear-gradient(135deg, #dc2626, #ef4444)",
              color: "white",
              padding: "24px",
              borderRadius: "16px",
              marginBottom: "25px",
              boxShadow:
                "0 10px 25px rgba(220, 38, 38, 0.18)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap"
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "30px"
                  }}
                >
                  🚨
                </div>

                <h2
                  style={{
                    color: "white",
                    margin:
                      "5px 0"
                  }}
                >
                  Need Emergency Assistance?
                </h2>

                <p
                  style={{
                    color: "#fee2e2",
                    margin: 0
                  }}
                >
                  Request roadside help for a
                  breakdown, towing, battery,
                  tire or fuel emergency.
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(
                    "/request-assistance"
                  )
                }
                style={{
                  background: "white",
                  color: "#dc2626",
                  padding:
                    "13px 22px",
                  fontWeight: "700",
                  whiteSpace:
                    "nowrap"
                }}
              >
                Request Help →
              </button>
            </div>
          </div>
        )}

        {/* Customer Services */}

        {user?.role === "user" && (
          <div>
            <div
              style={{
                marginBottom: "18px"
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#2563eb",
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "1px"
                }}
              >
                CUSTOMER SERVICES
              </p>

              <h2
                style={{
                  margin:
                    "5px 0"
                }}
              >
                What do you need?
              </h2>

              <p>
                Choose a service to manage your
                vehicle assistance.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px"
              }}
            >
              {customerServices.map(
                (service) => (
                  <div
                    key={service.title}
                    style={{
                      background: "white",
                      padding: "23px",
                      borderRadius:
                        "16px",
                      border: service.primary
                        ? "2px solid #fecaca"
                        : "1px solid #e5e7eb",
                      boxShadow:
                        "0 7px 25px rgba(15, 23, 42, 0.06)",
                      display: "flex",
                      flexDirection:
                        "column"
                    }}
                  >
                    <div
                      style={{
                        width: "55px",
                        height: "55px",
                        borderRadius:
                          "14px",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize: "29px",
                        background:
                          service.primary
                            ? "#fef2f2"
                            : "#eff6ff",
                        marginBottom:
                          "15px"
                      }}
                    >
                      {service.icon}
                    </div>

                    <h3
                      style={{
                        margin:
                          "0 0 7px",
                        color:
                          service.primary
                            ? "#b91c1c"
                            : "#1f2937"
                      }}
                    >
                      {service.title}
                    </h3>

                    <p
                      style={{
                        fontSize:
                          "14px",
                        flex: 1
                      }}
                    >
                      {service.description}
                    </p>

                    <button
                      onClick={() =>
                        navigate(
                          service.path
                        )
                      }
                      style={{
                        width: "100%",
                        background:
                          service.primary
                            ? "#dc2626"
                            : "#2563eb"
                      }}
                    >
                      {service.button}
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Partner Access */}

        {user?.role === "partner" && (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "17px",
              boxShadow:
                "0 7px 25px rgba(15, 23, 42, 0.07)"
            }}
          >
            <div
              style={{
                fontSize: "42px"
              }}
            >
              🔧
            </div>

            <p
              style={{
                color: "#2563eb",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1px"
              }}
            >
              SERVICE PARTNER
            </p>

            <h2>
              Manage your roadside assistance
              services
            </h2>

            <p>
              View customer requests, accept
              services, update service status and
              share your location.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/partner-dashboard"
                )
              }
            >
              Open Partner Dashboard →
            </button>
          </div>
        )}

        {/* Admin Access */}

        {user?.role === "admin" && (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "17px",
              boxShadow:
                "0 7px 25px rgba(15, 23, 42, 0.07)"
            }}
          >
            <div
              style={{
                fontSize: "42px"
              }}
            >
              🛡️
            </div>

            <p
              style={{
                color: "#2563eb",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1px"
              }}
            >
              ADMINISTRATION
            </p>

            <h2>
              Manage the platform
            </h2>

            <p>
              Monitor users, service partners and
              roadside assistance requests.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/admin-dashboard"
                )
              }
            >
              Open Admin Dashboard →
            </button>
          </div>
        )}

        {/* Account Information */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            marginTop: "25px",
            boxShadow:
              "0 7px 25px rgba(15, 23, 42, 0.06)"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "18px"
            }}
          >
            <div
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                background: "#eff6ff",
                fontSize: "22px"
              }}
            >
              👤
            </div>

            <div>
              <h2
                style={{
                  margin: 0
                }}
              >
                Account Information
              </h2>

              <p
                style={{
                  margin: 0,
                  fontSize: "13px"
                }}
              >
                Your registered account details
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "13px"
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                padding: "14px",
                borderRadius: "10px"
              }}
            >
              <strong>Name</strong>

              <p
                style={{
                  marginBottom: 0
                }}
              >
                {user?.name}
              </p>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "14px",
                borderRadius: "10px"
              }}
            >
              <strong>Email</strong>

              <p
                style={{
                  marginBottom: 0
                }}
              >
                {user?.email}
              </p>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "14px",
                borderRadius: "10px"
              }}
            >
              <strong>Phone</strong>

              <p
                style={{
                  marginBottom: 0
                }}
              >
                {user?.phone}
              </p>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "14px",
                borderRadius: "10px"
              }}
            >
              <strong>Role</strong>

              <p
                style={{
                  marginBottom: 0,
                  textTransform:
                    "capitalize"
                }}
              >
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "25px",
            paddingBottom: "20px"
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              background: "#dc2626",
              minWidth: "130px"
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;