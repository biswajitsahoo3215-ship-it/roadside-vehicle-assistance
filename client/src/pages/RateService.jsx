import { useState } from "react";
import axios from "axios";
import {
  useNavigate,
  useLocation
} from "react-router-dom";

function RateService() {
  const navigate = useNavigate();
  const location = useLocation();

  const request =
    location.state?.request;

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const token =
    localStorage.getItem("token");

  if (!request) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "40px 20px",
          background:
            "linear-gradient(135deg, #f8fafc, #eff6ff)"
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: "white",
            padding: "45px",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow:
              "0 10px 30px rgba(15, 23, 42, 0.08)"
          }}
        >
          <div
            style={{
              fontSize: "60px"
            }}
          >
            ⭐
          </div>

          <h1>
            Rate Service
          </h1>

          <p>
            No completed service request was
            selected for rating.
          </p>

          <button
            onClick={() =>
              navigate(
                "/service-history"
              )
            }
          >
            ← Service History
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert(
        "Please select a rating before submitting."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response =
        await axios.put(
          `http://localhost:5000/api/service-requests/${request._id}/rating`,
          {
            rating,
            feedback:
              feedback.trim()
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

      alert(
        response.data.message ||
          "Thank you for your feedback!"
      );

      navigate(
        "/service-history"
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to submit rating."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return "Very Poor";

      case 2:
        return "Poor";

      case 3:
        return "Average";

      case 4:
        return "Good";

      case 5:
        return "Excellent";

      default:
        return "Select a rating";
    }
  };

  const getRatingDescription = () => {
    switch (rating) {
      case 1:
        return "We're sorry your experience wasn't satisfactory.";

      case 2:
        return "We'll work to improve your experience.";

      case 3:
        return "Thank you. Your feedback helps us improve.";

      case 4:
        return "We're glad you had a good experience.";

      case 5:
        return "We're happy you had an excellent experience!";

      default:
        return "Your feedback helps us improve our roadside assistance service.";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px 20px",
        background:
          "linear-gradient(135deg, #f8fafc, #eff6ff)"
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto"
        }}
      >
        {/* Header */}

        <div
          style={{
            background:
              "linear-gradient(135deg, #0f172a, #1d4ed8)",
            padding: "32px",
            borderRadius: "20px",
            marginBottom: "22px",
            textAlign: "center",
            boxShadow:
              "0 12px 30px rgba(15, 23, 42, 0.16)"
          }}
        >
          <div
            style={{
              fontSize: "50px"
            }}
          >
            ⭐
          </div>

          <p
            style={{
              margin: 0,
              color: "#bfdbfe",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "1px"
            }}
          >
            SERVICE FEEDBACK
          </p>

          <h1
            style={{
              color: "white",
              margin:
                "7px 0"
            }}
          >
            Rate Your Experience
          </h1>

          <p
            style={{
              color: "#dbeafe",
              margin: 0
            }}
          >
            Your feedback helps us provide better
            roadside assistance.
          </p>
        </div>

        {/* Completed Service */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "17px",
            marginBottom: "20px",
            boxShadow:
              "0 7px 25px rgba(15, 23, 42, 0.07)"
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.5px"
            }}
          >
            COMPLETED SERVICE
          </p>

          <h2
            style={{
              margin:
                "6px 0 18px"
            }}
          >
            {request.serviceType}
          </h2>

          {request.partner && (
            <div
              style={{
                background:
                  "#f0fdf4",
                border:
                  "1px solid #bbf7d0",
                padding: "15px",
                borderRadius: "11px",
                marginBottom:
                  "12px"
              }}
            >
              <strong
                style={{
                  color:
                    "#166534"
                }}
              >
                🔧 Service Partner
              </strong>

              <p
                style={{
                  margin:
                    "5px 0 0"
                }}
              >
                {
                  request.partner
                    .businessName
                }
              </p>

              <p
                style={{
                  margin:
                    "3px 0 0",
                  fontSize: "13px",
                  color:
                    "#64748b"
                }}
              >
                Current partner rating: ⭐{" "}
                {
                  request.partner
                    .rating
                } / 5
              </p>
            </div>
          )}

          {request.vehicle && (
            <div
              style={{
                background:
                  "#f8fafc",
                padding: "15px",
                borderRadius:
                  "11px"
              }}
            >
              <strong>
                🚗 Vehicle
              </strong>

              <p
                style={{
                  margin:
                    "5px 0 0"
                }}
              >
                {request.vehicle.make}{" "}
                {request.vehicle.model}
              </p>

              <p
                style={{
                  margin:
                    "3px 0 0",
                  fontSize: "13px",
                  color:
                    "#64748b"
                }}
              >
                {
                  request.vehicle
                    .registrationNumber
                }
              </p>
            </div>
          )}
        </div>

        {/* Rating Form */}

        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "17px",
            boxShadow:
              "0 7px 25px rgba(15, 23, 42, 0.07)"
          }}
        >
          <form
            onSubmit={handleSubmit}
          >
            {/* Stars */}

            <div
              style={{
                textAlign:
                  "center"
              }}
            >
              <p
                style={{
                  margin: 0,
                  color:
                    "#64748b",
                  fontSize:
                    "13px",
                  fontWeight:
                    "600"
                }}
              >
                HOW WOULD YOU RATE THE SERVICE?
              </p>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "center",
                  gap: "4px",
                  margin:
                    "18px 0 10px"
                }}
              >
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setRating(
                          star
                        )
                      }
                      aria-label={`Rate ${star} out of 5`}
                      style={{
                        width:
                          "55px",
                        height:
                          "55px",
                        padding:
                          "0",
                        margin:
                          "0",
                        background:
                          "transparent",
                        color:
                          star <=
                          rating
                            ? "#f59e0b"
                            : "#cbd5e1",
                        fontSize:
                          "45px",
                        lineHeight:
                          "1",
                        boxShadow:
                          "none",
                        transform:
                          "none"
                      }}
                    >
                      {star <=
                      rating
                        ? "★"
                        : "☆"}
                    </button>
                  )
                )}
              </div>

              <div
                style={{
                  display:
                    "inline-block",
                  padding:
                    "7px 18px",
                  borderRadius:
                    "20px",
                  background:
                    rating
                      ? "#fff7ed"
                      : "#f8fafc",
                  color:
                    rating
                      ? "#c2410c"
                      : "#64748b",
                  fontWeight:
                    "700",
                  fontSize:
                    "14px"
                }}
              >
                {getRatingText()}
              </div>

              <p
                style={{
                  maxWidth:
                    "480px",
                  margin:
                    "12px auto 0",
                  fontSize:
                    "13px",
                  color:
                    "#64748b"
                }}
              >
                {getRatingDescription()}
              </p>
            </div>

            <hr />

            {/* Feedback */}

            <div>
              <h3
                style={{
                  margin:
                    "0 0 5px"
                }}
              >
                💬 Share Your Feedback
              </h3>

              <p>
                Tell us what went well or what
                could be improved.
              </p>

              <textarea
                value={feedback}
                onChange={(e) =>
                  setFeedback(
                    e.target.value
                  )
                }
                placeholder="Example: The mechanic arrived quickly and fixed my vehicle professionally..."
                rows="6"
                maxLength="1000"
                style={{
                  maxWidth:
                    "100%",
                  padding:
                    "13px"
                }}
              />

              <p
                style={{
                  textAlign:
                    "right",
                  fontSize:
                    "11px",
                  color:
                    "#64748b",
                  margin:
                    "5px 0 0"
                }}
              >
                {feedback.length}/1000
              </p>
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={
                submitting ||
                rating === 0
              }
              style={{
                width:
                  "100%",
                padding:
                  "15px",
                marginTop:
                  "20px",
                fontSize:
                  "16px",
                background:
                  rating === 0
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #1d4ed8, #2563eb)"
              }}
            >
              {submitting
                ? "Submitting Feedback..."
                : "⭐ Submit Rating"}
            </button>
          </form>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/service-history"
              )
            }
            style={{
              width:
                "100%",
              marginTop:
                "10px",
              background:
                "#64748b"
            }}
          >
            ← Back to Service History
          </button>
        </div>

        {/* Privacy Note */}

        <div
          style={{
            textAlign:
              "center",
            padding:
              "20px 10px"
          }}
        >
          <p
            style={{
              fontSize:
                "12px",
              color:
                "#64748b",
              margin: 0
            }}
          >
            ⭐ Your feedback helps improve the
            roadside assistance experience for
            everyone.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RateService;