import React, { useState } from "react";
import styled from "styled-components";

const QuestionText = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const Timer = styled.p`
  font-size: 1rem;
  font-weight: bold;
  color: #ffcf61;
`;

const Input = styled.input`
  width: 80%;
  padding: 0.75rem;
  margin-top: 1rem;
  border: 2px solid #ff6f61;
  border-radius: 5px;
  font-size: 1rem;
`;

const SubmitButton = styled.button`
  background: #ff6f61;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #ff877a;
  }
`;

const MusicStartButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #0056b3;
  }
`;
const FeedbackText = styled.p`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${(props) =>
    props.isCorrect ? "#28a745" : "#dc3545"}; // 정답: 초록, 오답: 빨강
`;

const Quiz = ({ quiz, onAnswer }) => {
  const [timeLeft, setTimeLeft] = useState(20); // 20초로 변경
  const [userAnswer, setUserAnswer] = useState("");
  const [isPlaying, setIsPlaying] = useState(false); // 음악 재생 상태
  const [showAnswer, setShowAnswer] = useState(false); // 정답 표시 상태
  const [feedback, setFeedback] = useState(null); // 정답/오답 메시지 상태
  const [gameStarted, setGameStarted] = useState(false); // 게임 시작 여부

  // 문자열 정규화 함수 (띄어쓰기 제거 및 소문자로 변환)
  const normalizeString = (str) => {
    return str.toLowerCase().replace(/\s+/g, ""); // 공백 제거
  };

  const handlePlayAudio = () => {
    const audio = new Audio(quiz.previewUrl);
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        const timer = setInterval(() => {
          setTimeLeft((prev) => Math.max(prev - 1, 0));
        }, 1000);

        // 시간 종료 후 처리
        setTimeout(() => {
          clearInterval(timer);
          setIsPlaying(false);
          setShowAnswer(true); // 정답 표시
        }, 20000); // 20초 후 종료
      })
      .catch((error) => {
        console.error("Audio play failed:", error);
      });
  };
  const handleStartGame = () => {
    setGameStarted(true); // 게임 시작
  };

  const handleSubmit = () => {
    const isCorrect =
      normalizeString(userAnswer) === normalizeString(quiz.name);

    setFeedback(isCorrect ? "정답입니다!" : "오답입니다!"); // 정답/오답 메시지 설정

    setTimeout(() => {
      setFeedback(null); // 피드백 초기화
      setUserAnswer(""); // 입력 필드 초기화
      onAnswer(isCorrect); // 다음 문제로 이동
    }, 2000); // 2초 후 다음 문제로 이동
  };

  return (
    <div>
      {!gameStarted ? (
        <MusicStartButton onClick={handleStartGame}>
          Music Start
        </MusicStartButton>
      ) : (
        <>
          <QuestionText>이 노래는 무엇일까요?</QuestionText>
          {isPlaying ? (
            <Timer>남은 시간: {timeLeft}초</Timer>
          ) : showAnswer ? (
            <p>
              시간 초과! 정답은 <strong>{quiz.name}</strong>입니다.
              <SubmitButton onClick={() => onAnswer(false)}>
                다음 문제
              </SubmitButton>
            </p>
          ) : feedback ? (
            <FeedbackText isCorrect={feedback === "정답입니다!"}>
              {feedback}
            </FeedbackText>
          ) : (
            <>
              <SubmitButton onClick={handlePlayAudio}>Play Music</SubmitButton>
              <Input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="곡명을 입력하세요"
              />
              <SubmitButton onClick={handleSubmit}>제출</SubmitButton>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Quiz;
