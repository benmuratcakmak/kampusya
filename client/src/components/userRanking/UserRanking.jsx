// UserRanking.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const UserRanking = () => {
  const [userRanking, setUserRanking] = useState([]);

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
    <div>
      <h2>HAFTANIN EN COK ETKILESIM ALAN OGRENCILERI</h2>
      <table>
        {/* <thead>
          <tr>
            <th>Profil Fotoğrafı</th>
            <th>Kullanıcı Adı</th>
            <th>İsim</th>
            <th>Soyisim</th>
            <th>Fakülte</th>
            <th>Departman</th>
            <th>Beğeni Sayısı</th>
            <th>Yorum Sayısı</th>
          </tr>
        </thead> */}
        <tbody>
          {userRanking.map((user, index) => (
            <tr key={index}>
              <td>
                <img
                  src={user.photo || "/default-avatar.png"} // Eğer profil fotoğrafı yoksa varsayılan fotoğraf göster
                  alt={`${user.username} Profil Fotoğrafı`}
                  style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                />
              </td>
              <td>{user.username}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.faculty}</td>
              <td>{user.department}</td>
              <td>{user.likeCount}</td>
              <td>{user.commentCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserRanking;

// routes/ranking.js

