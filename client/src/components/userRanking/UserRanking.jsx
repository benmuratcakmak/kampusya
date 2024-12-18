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

  return (
    <div className="container-fluid ranking-container">
      <div>
        <h1 className="ranking-title">
          HAFTANIN EN ÇOK ETKİLEŞİM ALAN ÖĞRENCİLERİ
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
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                            }}
                          />
                        </td>
                        <td>{user.username}</td>
                        <td>{user.firstName || "Bilinmiyor"}</td>
                        <td>{user.lastName || "Bilinmiyor"}</td>
                        <td>
                          {user.faculty === null || user.faculty === ""
                            ? "....."
                            : user.faculty}
                        </td>
                        <td>
                          {user.department === null || user.department === ""
                            ? "....."
                            : user.department}
                        </td>
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
