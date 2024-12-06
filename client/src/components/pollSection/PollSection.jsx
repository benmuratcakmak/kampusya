import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PollSection.css";

const PollSection = ({
  postId,
  pollQuestion,
  pollOptions,
  initialVotes,
  userId,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isVoted, setIsVoted] = useState(false);
  const [votes, setVotes] = useState(
    initialVotes || pollOptions.map((option) => option.votes || 0)
  );

  useEffect(() => {
    if (isVoted) {
      // Oy verildikten sonra API'ye oyu gönder
      axios
        .post(`/posts/${postId}/vote`, { userId, optionIndex: selectedOption })
        .then((response) => {
          console.log("Oylama başarılı:", response.data);
          // Oylama sonrası sonuçları güncelle
          setVotes(response.data.poll);
        })
        .catch((error) => {
          console.error("Oylama işlemi sırasında hata oluştu:", error);
        });
    }
  }, [isVoted, selectedOption, postId, userId]);

  const handleVote = (index) => {
    if (!isVoted) {
      // İlk defa oy veriliyorsa
      setVotes((prevVotes) => {
        const newVotes = [...prevVotes];
        newVotes[index] += 1;
        return newVotes;
      });
      setSelectedOption(index);
      setIsVoted(true);
    } else if (isVoted && selectedOption !== index) {
      // Eğer zaten oy verilmişse, ancak oy değiştirilmek isteniyorsa, oy değiştirilmesine izin ver
      setVotes((prevVotes) => {
        const newVotes = [...prevVotes];
        newVotes[selectedOption] -= 1; // Önceki oy azaltılır
        newVotes[index] += 1; // Yeni oy eklenir
        return newVotes;
      });
      setSelectedOption(index); // Yeni oyu seç
    }
  };

  return (
    <div className="poll-section">
      <h3 className="poll-question">{pollQuestion}</h3>
      <ul className="poll-options">
        {pollOptions.map((option, index) => (
          <li
            key={option._id || index}
            className={`poll-option ${isVoted ? "voted" : ""}`}
            onClick={() => handleVote(index)}
          >
            <span>{option.option}</span>
            {isVoted && (
              <div className="poll-result">
                {selectedOption === index && (
                  <span>✔ Seçilen Cevap: {option.option}</span>
                )}
                <span>{votes[index]} oy</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PollSection;
