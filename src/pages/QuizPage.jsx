import React, { useState, useEffect } from "react";

const Quiz = ({ quiz, onAnswer }) => {
  const [timeLeft, setTimeLeft] = useState(20); // 20초로 변경
  const [userAnswer, setUserAnswer] = useState("");
  const [isPlaying, setIsPlaying] = useState(false); // 음악 재생 상태
  const [showAnswer, setShowAnswer] = useState(false); // 정답 표시 상태

  const handlePlayAudio = () => {
    const audio = new Audio(quiz.previewUrl);
    audio
      .play()
      .then(() => {
        setIsPlaying(true); // 재생 상태 업데이트
        const timer = setInterval(() => {
          setTimeLeft((prev) => Math.max(prev - 1, 0));
        }, 1000);

        // 시간 종료 후 처리
        setTimeout(() => {
          clearInterval(timer);
          setIsPlaying(false); // 음악 재생 상태 초기화
          setShowAnswer(true); // 정답 표시
        }, 20000); // 20초 후 종료
      })
      .catch((error) => {
        console.error("Audio play failed:", error);
      });
  };

  const handleSubmit = () => {
    const isCorrect = userAnswer.toLowerCase() === quiz.name.toLowerCase();
    onAnswer(isCorrect);
    setUserAnswer(""); // 입력 초기화
    setShowAnswer(false); // 정답 초기화
  };

  return (
    <div>
      <h2>이 노래는 무엇일까요?</h2>
      {isPlaying ? (
        <p>Time Left: {timeLeft}s</p>
      ) : showAnswer ? (
        <p>
          시간 초과! 정답은 <strong>{quiz.name}</strong>입니다.
          <button onClick={() => onAnswer(false)}>다음 문제</button>
        </p>
      ) : (
        <button onClick={handlePlayAudio}>Play Music</button>
      )}
      {!showAnswer && (
        <>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="곡명을 입력하세요"
          />
          <button onClick={handleSubmit}>Submit</button>
        </>
      )}
    </div>
  );
};

export default Quiz;
