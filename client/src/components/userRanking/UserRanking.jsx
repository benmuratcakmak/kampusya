// UserRanking.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row } from "react-bootstrap";
import "./UserRanking.css";
import { useNavigate } from "react-router-dom";

const UserRanking = () => {
  const [userRanking, setUserRanking] = useState([]);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await axios.get("/api/ranking");
        setUserRanking(response.data);
      } catch (error) {
        console.error("Error fetching user ranking", error);
      }
    };

    fetchRanking();
  }, []);

  useEffect(() => {
    // Kar tanelerini oluştur
    const createSnowflakes = () => {
      const container = document.querySelector('.ranking-container');
      const snowflakeCount = 100;

      for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.animationDelay = `${Math.random() * 15}s`;
        const snowflakes = ['❄', '❅', '❆'];
        snowflake.innerHTML = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        container.appendChild(snowflake);
      }
    };

    createSnowflakes();

    return () => {
      const snowflakes = document.querySelectorAll('.snowflake');
      snowflakes.forEach(snowflake => snowflake.remove());
    };
  }, []);

  return (
    <div className="container-fluid ranking-container">
      <div>
        <h1 className="ranking-title">
          HAFTALIK ETKİLEŞİM LİDERLERİ
        </h1>
      </div>
      <Container className="my-3">
        <Row className="d-flex justify-content-center">
          <div className="table-container">
            <div className="container">
              <div className="table-responsive">
                <table className="table netflix-table">
                  <tbody>
                    {userRanking.map((user, index) => (
                      <tr
                        key={index}
                        onClick={() => navigate("/profile/" + user.username)}
                      >
                        <td>{index + 1}</td>
                        <td>
                          <img
                            src={user.photo || "/default-avatar.png"}
                            alt={`${user.username} Profil Fotoğrafı`}
                            style={{
                              width: "45px",
                              height: "45px",
                              borderRadius: "50%",
                              border: "3px solid transparent",
                              background: "linear-gradient(45deg, #ff3333, #ff6666) padding-box, linear-gradient(45deg, #ff3333, #ff6666) border-box",
                              transition: "all 0.3s ease",
                              boxShadow: "0 0 15px rgba(255, 51, 51, 0.2)"
                            }}
                          />
                        </td>
                        <td>{user.username}</td>
                        <td>{(user.firstName || "Bilinmiyor") + " " + (user.lastName || "")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Row>
      </Container>
    </div>
  );
};

export default UserRanking;

// routes/ranking.js
