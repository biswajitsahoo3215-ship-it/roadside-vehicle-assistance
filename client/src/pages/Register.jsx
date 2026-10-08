import { useState } from "react";

import axios from "axios";

import { API_URL } from "../config";

import { useNavigate } from "react-router-dom";



function Register() {

  const navigate = useNavigate();



  const [formData, setFormData] = useState({

    name: "",

    email: "",

    phone: "",

    password: ""

  });



  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =

    useState(false);



  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };



  const handleRegister = async (e) => {

    e.preventDefault();

    setLoading(true);



    try {

      const response = await axios.post(

        `${API_URL}/auth/register`,

        {

          name: formData.name.trim(),

          email: formData.email.trim(),

          phone: formData.phone.trim(),

          password: formData.password

        }

      );



      alert(

        response.data.message ||

        "Registration successful"

      );



      navigate("/");

    } catch (error) {

      console.error(

        "Registration error:",

        error

      );



      alert(

        error.response?.data?.message ||

        "Registration failed. Please try again."

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

          minHeight: "700px",

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

              width: "300px",

              height: "300px",

              borderRadius: "50%",

              background:

                "rgba(255,255,255,0.08)",

              top: "-110px",

              right: "-90px"

            }}

          />



          <div

            style={{

              position: "absolute",

              width: "240px",

              height: "240px",

              borderRadius: "50%",

              background:

                "rgba(255,255,255,0.06)",

              bottom: "-110px",

              left: "-90px"

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

              Join Roadside

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

              Create your account and get quick

              access to trusted mechanics,

              emergency roadside services and

              real-time assistance.

            </p>



            <div

              style={{

                marginTop: "40px",

                display: "flex",

                flexDirection: "column",

                gap: "15px"

              }}

            >

              {[

                [

                  "⚡",

                  "Quick roadside assistance"

                ],

                [

                  "🛠️",

                  "Verified service partners"

                ],

                [

                  "📍",

                  "Real-time service tracking"

                ]

              ].map(

                ([icon, text]) => (

                  <div

                    key={text}

                    style={{

                      display: "flex",

                      alignItems: "center",

                      gap: "13px"

                    }}

                  >

                    <div

                      style={{

                        width: "38px",

                        height: "38px",

                        borderRadius: "10px",

                        background:

                          "rgba(255,255,255,0.12)",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center"

                      }}

                    >

                      {icon}

                    </div>



                    <span

                      style={{

                        fontSize: "14px",

                        color:

                          "rgba(255,255,255,0.9)"

                      }}

                    >

                      {text}

                    </span>

                  </div>

                )

              )}

            </div>

          </div>

        </div>



        <div

          style={{

            padding: "50px",

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

                marginBottom: "28px"

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

                Get started

              </div>



              <h2

                style={{

                  margin: 0,

                  fontSize: "32px",

                  color: "#0f172a",

                  fontWeight: 800

                }}

              >

                Create your account

              </h2>



              <p

                style={{

                  color: "#64748b",

                  marginTop: "10px",

                  marginBottom: 0,

                  fontSize: "14px"

                }}

              >

                Register to request roadside

                assistance whenever you need it.

              </p>

            </div>



            <form

              onSubmit={handleRegister}

            >

              <div

                style={{

                  marginBottom: "16px"

                }}

              >

                <label

                  style={{

                    display: "block",

                    marginBottom: "7px",

                    fontSize: "14px",

                    fontWeight: 700,

                    color: "#334155"

                  }}

                >

                  Full Name

                </label>



                <input

                  type="text"

                  name="name"

                  value={formData.name}

                  onChange={handleChange}

                  placeholder="Enter your full name"

                  required

                  style={{

                    width: "100%",

                    boxSizing: "border-box",

                    padding: "13px 14px",

                    border:

                      "1px solid #e2e8f0",

                    borderRadius: "11px",

                    fontSize: "14px",

                    outline: "none",

                    color: "#0f172a",

                    background: "#f8fafc"

                  }}

                />

              </div>



              <div

                style={{

                  marginBottom: "16px"

                }}

              >

                <label

                  style={{

                    display: "block",

                    marginBottom: "7px",

                    fontSize: "14px",

                    fontWeight: 700,

                    color: "#334155"

                  }}

                >

                  Email Address

                </label>



                <input

                  type="email"

                  name="email"

                  value={formData.email}

                  onChange={handleChange}

                  placeholder="Enter your email"

                  required

                  style={{

                    width: "100%",

                    boxSizing: "border-box",

                    padding: "13px 14px",

                    border:

                      "1px solid #e2e8f0",

                    borderRadius: "11px",

                    fontSize: "14px",

                    outline: "none",

                    color: "#0f172a",

                    background: "#f8fafc"

                  }}

                />

              </div>



              <div

                style={{

                  marginBottom: "16px"

                }}

              >

                <label

                  style={{

                    display: "block",

                    marginBottom: "7px",

                    fontSize: "14px",

                    fontWeight: 700,

                    color: "#334155"

                  }}

                >

                  Phone Number

                </label>



                <input

                  type="tel"

                  name="phone"

                  value={formData.phone}

                  onChange={handleChange}

                  placeholder="Enter your phone number"

                  required

                  style={{

                    width: "100%",

                    boxSizing: "border-box",

                    padding: "13px 14px",

                    border:

                      "1px solid #e2e8f0",

                    borderRadius: "11px",

                    fontSize: "14px",

                    outline: "none",

                    color: "#0f172a",

                    background: "#f8fafc"

                  }}

                />

              </div>



              <div

                style={{

                  marginBottom: "22px"

                }}

              >

                <label

                  style={{

                    display: "block",

                    marginBottom: "7px",

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

                  <input

                    type={

                      showPassword

                        ? "text"

                        : "password"

                    }

                    name="password"

                    value={formData.password}

                    onChange={handleChange}

                    placeholder="Create a password"

                    required

                    minLength={6}

                    style={{

                      width: "100%",

                      boxSizing: "border-box",

                      padding:

                        "13px 45px 13px 14px",

                      border:

                        "1px solid #e2e8f0",

                      borderRadius: "11px",

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

                      right: "11px",

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

                  padding: "14px",

                  border: "none",

                  borderRadius: "11px",

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

                  ? "Creating account..."

                  : "Create Account"}

              </button>

            </form>



            <div

              style={{

                textAlign: "center",

                marginTop: "23px",

                paddingTop: "20px",

                borderTop:

                  "1px solid #e2e8f0",

                fontSize: "14px",

                color: "#64748b"

              }}

            >

              Already have an account?{" "}

              <button

                type="button"

                onClick={() =>

                  navigate("/")

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

                Sign in

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



export default Register;