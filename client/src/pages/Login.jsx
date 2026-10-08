import { useState } from "react";

import axios from "axios";

import { API_URL } from "../config";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";



function Login() {

  const navigate = useNavigate();

  const { login } = useAuth();



  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =

    useState(false);



  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);



    try {

      const response = await axios.post(

        `${API_URL}/auth/login`,

        {

          email: email.trim(),

          password

        }

      );



      const {

        token,

        user

      } = response.data;



      login(user, token);



      if (user.role === "admin") {

        navigate("/admin-dashboard");

      } else if (user.role === "partner") {

        navigate("/partner-dashboard");

      } else {

        navigate("/dashboard");

      }

    } catch (error) {

      console.error(

        "Login error:",

        error

      );



      alert(

        error.response?.data?.message ||

        "Login failed. Please check your credentials."

      );

    } finally {

      setLoading(false);

    }

  };



  return (

    <div

      style={{

        minHeight: "100vh",

        background:

          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        padding: "24px",

        fontFamily:

          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

      }}

    >

      <div

        style={{

          width: "100%",

          maxWidth: "1100px",

          minHeight: "650px",

          background: "#ffffff",

          borderRadius: "28px",

          overflow: "hidden",

          display: "grid",

          gridTemplateColumns:

            "1fr 1fr",

          boxShadow:

            "0 30px 80px rgba(0,0,0,0.35)"

        }}

      >

        <div

          style={{

            background:

              "linear-gradient(145deg, #2563eb, #1d4ed8, #1e40af)",

            color: "#ffffff",

            padding: "60px 50px",

            display: "flex",

            flexDirection: "column",

            justifyContent: "center",

            position: "relative",

            overflow: "hidden"

          }}

        >

          <div

            style={{

              position: "absolute",

              width: "280px",

              height: "280px",

              borderRadius: "50%",

              background:

                "rgba(255,255,255,0.08)",

              top: "-100px",

              right: "-80px"

            }}

          />



          <div

            style={{

              position: "absolute",

              width: "220px",

              height: "220px",

              borderRadius: "50%",

              background:

                "rgba(255,255,255,0.06)",

              bottom: "-100px",

              left: "-80px"

            }}

          />



          <div

            style={{

              position: "relative",

              zIndex: 1

            }}

          >

            <div

              style={{

                width: "72px",

                height: "72px",

                borderRadius: "20px",

                background:

                  "rgba(255,255,255,0.16)",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                fontSize: "34px",

                marginBottom: "28px",

                border:

                  "1px solid rgba(255,255,255,0.2)"

              }}

            >

              🚗

            </div>



            <h1

              style={{

                fontSize: "42px",

                lineHeight: 1.1,

                margin: "0 0 18px",

                fontWeight: 800

              }}

            >

              Roadside

              <br />

              Assistance

            </h1>



            <p

              style={{

                fontSize: "17px",

                lineHeight: 1.7,

                color:

                  "rgba(255,255,255,0.82)",

                maxWidth: "420px",

                margin: 0

              }}

            >

              Get reliable roadside assistance

              whenever you need it. Connect with

              trusted mechanics and service partners

              quickly and safely.

            </p>



            <div

              style={{

                display: "grid",

                gridTemplateColumns:

                  "repeat(3, 1fr)",

                gap: "12px",

                marginTop: "42px"

              }}

            >

              <div

                style={{

                  padding: "15px 10px",

                  borderRadius: "14px",

                  background:

                    "rgba(255,255,255,0.1)",

                  textAlign: "center",

                  border:

                    "1px solid rgba(255,255,255,0.12)"

                }}

              >

                <div

                  style={{

                    fontSize: "24px",

                    fontWeight: 800

                  }}

                >

                  24/7

                </div>

                <div

                  style={{

                    fontSize: "12px",

                    marginTop: "4px",

                    color:

                      "rgba(255,255,255,0.75)"

                  }}

                >

                  Support

                </div>

              </div>



              <div

                style={{

                  padding: "15px 10px",

                  borderRadius: "14px",

                  background:

                    "rgba(255,255,255,0.1)",

                  textAlign: "center",

                  border:

                    "1px solid rgba(255,255,255,0.12)"

                }}

              >

                <div

                  style={{

                    fontSize: "24px",

                    fontWeight: 800

                  }}

                >

                  Fast

                </div>

                <div

                  style={{

                    fontSize: "12px",

                    marginTop: "4px",

                    color:

                      "rgba(255,255,255,0.75)"

                  }}

                >

                  Response

                </div>

              </div>



              <div

                style={{

                  padding: "15px 10px",

                  borderRadius: "14px",

                  background:

                    "rgba(255,255,255,0.1)",

                  textAlign: "center",

                  border:

                    "1px solid rgba(255,255,255,0.12)"

                }}

              >

                <div

                  style={{

                    fontSize: "24px",

                    fontWeight: 800

                  }}

                >

                  Trusted

                </div>

                <div

                  style={{

                    fontSize: "12px",

                    marginTop: "4px",

                    color:

                      "rgba(255,255,255,0.75)"

                  }}

                >

                  Partners

                </div>

              </div>

            </div>

          </div>

        </div>



        <div

          style={{

            padding: "55px 50px",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            background: "#ffffff"

          }}

        >

          <div

            style={{

              width: "100%",

              maxWidth: "410px"

            }}

          >

            <div

              style={{

                marginBottom: "34px"

              }}

            >

              <div

                style={{

                  color: "#2563eb",

                  fontSize: "13px",

                  fontWeight: 700,

                  textTransform: "uppercase",

                  letterSpacing: "1px",

                  marginBottom: "10px"

                }}

              >

                Welcome back

              </div>



              <h2

                style={{

                  margin: 0,

                  fontSize: "32px",

                  color: "#0f172a",

                  fontWeight: 800

                }}

              >

                Sign in to your account

              </h2>



              <p

                style={{

                  color: "#64748b",

                  marginTop: "10px",

                  marginBottom: 0,

                  fontSize: "14px"

                }}

              >

                Access your roadside assistance

                dashboard.

              </p>

            </div>



            <form onSubmit={handleLogin}>

              <div

                style={{

                  marginBottom: "20px"

                }}

              >

                <label

                  style={{

                    display: "block",

                    marginBottom: "8px",

                    fontSize: "14px",

                    fontWeight: 700,

                    color: "#334155"

                  }}

                >

                  Email Address

                </label>



                <div

                  style={{

                    position: "relative"

                  }}

                >

                  <span

                    style={{

                      position: "absolute",

                      left: "15px",

                      top: "50%",

                      transform:

                        "translateY(-50%)",

                      fontSize: "17px",

                      color: "#94a3b8"

                    }}

                  >

                    ✉

                  </span>



                  <input

                    type="email"

                    value={email}

                    onChange={(e) =>

                      setEmail(

                        e.target.value

                      )

                    }

                    placeholder="Enter your email"

                    required

                    style={{

                      width: "100%",

                      boxSizing: "border-box",

                      padding:

                        "14px 15px 14px 45px",

                      border:

                        "1px solid #e2e8f0",

                      borderRadius: "12px",

                      fontSize: "14px",

                      outline: "none",

                      color: "#0f172a",

                      background: "#f8fafc"

                    }}

                  />

                </div>

              </div>



              <div

                style={{

                  marginBottom: "24px"

                }}

              >

                <label

                  style={{

                    display: "block",

                    marginBottom: "8px",

                    fontSize: "14px",

                    fontWeight: 700,

                    color: "#334155"

                  }}

                >

                  Password

                </label>



                <div

                  style={{

                    position: "relative"

                  }}

                >

                  <span

                    style={{

                      position: "absolute",

                      left: "15px",

                      top: "50%",

                      transform:

                        "translateY(-50%)",

                      fontSize: "17px",

                      color: "#94a3b8"

                    }}

                  >

                    🔒

                  </span>



                  <input

                    type={

                      showPassword

                        ? "text"

                        : "password"

                    }

                    value={password}

                    onChange={(e) =>

                      setPassword(

                        e.target.value

                      )

                    }

                    placeholder="Enter your password"

                    required

                    style={{

                      width: "100%",

                      boxSizing: "border-box",

                      padding:

                        "14px 48px 14px 45px",

                      border:

                        "1px solid #e2e8f0",

                      borderRadius: "12px",

                      fontSize: "14px",

                      outline: "none",

                      color: "#0f172a",

                      background: "#f8fafc"

                    }}

                  />



                  <button

                    type="button"

                    onClick={() =>

                      setShowPassword(

                        !showPassword

                      )

                    }

                    style={{

                      position: "absolute",

                      right: "12px",

                      top: "50%",

                      transform:

                        "translateY(-50%)",

                      border: "none",

                      background:

                        "transparent",

                      cursor: "pointer",

                      fontSize: "16px",

                      color: "#64748b"

                    }}

                  >

                    {showPassword

                      ? "🙈"

                      : "👁️"}

                  </button>

                </div>

              </div>



              <button

                type="submit"

                disabled={loading}

                style={{

                  width: "100%",

                  padding: "15px",

                  border: "none",

                  borderRadius: "12px",

                  background:

                    loading

                      ? "#94a3b8"

                      : "linear-gradient(135deg, #2563eb, #1d4ed8)",

                  color: "#ffffff",

                  fontSize: "15px",

                  fontWeight: 700,

                  cursor: loading

                    ? "not-allowed"

                    : "pointer",

                  boxShadow:

                    "0 8px 20px rgba(37,99,235,0.25)"

                }}

              >

                {loading

                  ? "Signing in..."

                  : "Sign In"}

              </button>

            </form>



            <div

              style={{

                textAlign: "center",

                marginTop: "26px",

                paddingTop: "22px",

                borderTop:

                  "1px solid #e2e8f0",

                fontSize: "14px",

                color: "#64748b"

              }}

            >

              Don't have an account?{" "}

              <button

                type="button"

                onClick={() =>

                  navigate("/register")

                }

                style={{

                  border: "none",

                  background: "transparent",

                  color: "#2563eb",

                  fontWeight: 700,

                  cursor: "pointer",

                  fontSize: "14px",

                  padding: 0

                }}

              >

                Create account

              </button>

            </div>

          </div>

        </div>

      </div>

      <style>{`

        @media (max-width: 800px) {

          div[style*="grid-template-columns: 1fr 1fr"] {

            grid-template-columns: 1fr !important;

          }

        }

      `}</style>

    </div>

  );

}



export default Login;