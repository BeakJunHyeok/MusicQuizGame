import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import englishToKorean from "./englishKorean.json";

const CircularProgressContainer = styled.div`
  position: relative;
  width: 160px;
  height: 160px; /* 프로그래스바 + 시간 텍스트 높이 */
  margin: 1rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

const CircularProgressBar = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(
    #dbdcde ${(props) => props.progress}%,
    #05b2ed ${(props) => props.progress}% 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TimeText = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  text-align: center;
`;

const PlayPauseButton = styled.img`
  margin: 0 auto;
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;
  object-fit: cover;
`;

const Contents = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  justify-content: center;
  align-items: center;
  @media (max-width: 430px) {
    width: 100%;
  }
`;

const Input = styled.input`
  width: 360px;
  padding: 16px;
  margin-top: 1rem;
  border: 2px solid #ff6f61;
  border-radius: 5px;
  font-size: 1rem;
  &:focus {
    outline: none;
  }
  @media (max-width: 430px) {
    width: 240px;
  }
`;

const Buttons = styled.div`
  width: 100%;
  display: flex;
  gap: 16px;
  margin-top: 4px;
  @media (max-width: 430px) {
    width: 100%;
  }
`;

const SubmitButton = styled.button`
  background: #ff6f61;
  color: white;
  border: none;
  padding: 12px 26px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background: #ff877a;
  }
`;
const StartButton = styled.button`
  background: #ff6f61;
  color: white;
  border: none;
  padding: 16px 24px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  margin: 0 auto;
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background: #ff877a;
  }
`;
const SkipButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 26px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background: #0056b3;
  }
`;

const Volume = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-left: 20px;
  @media (max-width: 430px) {
    display: none;
  }
`;

const Icon = styled.img`
  width: 28px;
  object-fit: cover;
  filter: invert(100%);
`;
const VolumeControl = styled.input`
  width: 80%;
`;

const FeedbackText = styled.p`
  text-align: center;
  font-size: 36px;
  font-weight: bold;
  color: ${(props) =>
    props.isCorrect ? "#28a745" : "#dc3545"}; // 정답: 초록, 오답: 빨강
`;

const QuizStatus = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
  color: #ff6f61;
`;

const Answer = styled.div`
  font-size: 22px;
  font-weight: bold;
  width: 100%;
`;

const StartArea = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const DescText = styled.p`
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  background: #007bff;
  padding: 30px;
  @media (max-width: 430px) {
    padding: 20px 10px;
    font-size: 16px;
  }
`;

const Quiz = ({ quiz, onAnswer, currentQuizIndex, totalQuizzes }) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false); // 정답 표시 상태
  const [feedback, setFeedback] = useState(null); // 정답/오답 메시지 상태
  const [gameStarted, setGameStarted] = useState(false); // 게임 시작 여부
  const [timeLeft, setTimeLeft] = useState(10); // 노래 남은 시간
  const [isPaused, setIsPaused] = useState(false); // 중지 상태
  const [volume, setVolume] = useState(0.3); // 초기 볼륨 (1 = 100%)
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null); // 타이머 관리

  useEffect(() => {
    if (gameStarted) {
      handlePlayAudio();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quiz, gameStarted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume; // 볼륨 조절
    }
  }, [volume]);

  // 문자열 정규화 함수 (띄어쓰기 제거 및 소문자로 변환)
  const normalizeString = (str) => {
    return str
      .toLowerCase() // 소문자로 변환
      .replace(/\s+/g, "") // 공백 제거
      .replace(/[^\w가-힣()\-]/g, "") // 허용된 문자 제외 제거 (괄호와 대시 포함)
      .split("(")[0] // '(' 이후 제거
      .split("-")[0]; // '-' 이후 제거
  };

  const isEquivalent = (input, answer) => {
    const normalizedInput = normalizeString(input); // 입력값 정규화
    const normalizedAnswer = normalizeString(answer); // 정답 정규화

    // JSON 매핑: 키와 값 모두에서 매핑을 시도
    const inputToKorean = englishToKorean[normalizedInput] || normalizedInput; // 입력값 -> 한글 변환
    const answerToKorean =
      englishToKorean[normalizedAnswer] || normalizedAnswer; // 정답 -> 한글 변환

    // 역 매핑: 한글 값 -> 영어 키 변환
    const reversedMapping = Object.entries(englishToKorean).reduce(
      (acc, [key, value]) => {
        acc[value] = key; // 한글 값이 키, 영어 키가 값
        return acc;
      },
      {}
    );

    const inputToEnglish = reversedMapping[normalizedInput] || normalizedInput; // 입력값 -> 영어 변환
    const answerToEnglish =
      reversedMapping[normalizedAnswer] || normalizedAnswer; // 정답 -> 영어 변환

    return (
      inputToKorean === answerToKorean || // 매핑된 한글 값 비교
      normalizedInput === normalizedAnswer || // 정규화된 원본 값 비교
      inputToEnglish === normalizedAnswer || // 입력값(한글)이 영어 정답과 매칭
      inputToKorean === normalizedAnswer // 입력값(영어)이 한글 정답과 매칭
    );
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current); // 기존 타이머 제거
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current); // 타이머 정리
          handleSkip(); // 시간 초과 처리
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause(); // 이전 음악 중지
      audioRef.current = null; // 기존 오디오 객체 초기화
    }

    if (timerRef.current) {
      clearInterval(timerRef.current); // 기존 타이머 정리
    }

    // 새로운 음악 재생
    const audio = new Audio(quiz.previewUrl);
    audioRef.current = audio;
    audio.volume = volume;
    audio
      .play()
      .then(() => setIsPaused(false))
      .catch((error) => console.error("Audio play failed:", error));

    setTimeLeft(10); // 남은 시간 초기화
    startTimer(); // 타이머 시작
  };

  const handlePauseResume = () => {
    if (isPaused) {
      // 재개
      setIsPaused(false);
      audioRef.current?.play();
      startTimer(); // 타이머 재시작
    } else {
      // 중지
      setIsPaused(true);
      audioRef.current?.pause();
      clearInterval(timerRef.current); // 타이머 중지
    }
  };

  const handleVolumeToggle = () => {
    setIsVolumeVisible((prev) => !prev); // 볼륨 컨트롤 표시 토글
  };

  const handleSubmit = () => {
    const isCorrect = isEquivalent(userAnswer, quiz.name);

    setFeedback(isCorrect ? "정답!" : "오답!");
    setShowAnswer(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer("");
      setShowAnswer(false);
      setIsPaused(false);
      onAnswer(isCorrect);
    }, 1000);
  };

  const handleSkip = () => {
    setFeedback("오답!");
    setShowAnswer(true);

    // 음악과 타이머 정리
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer("");
      setShowAnswer(false);
      setIsPaused(false);
      onAnswer(false);
    }, 1000);
  };

  return (
    <div>
      {!gameStarted ? (
        <StartArea>
          <DescText>
            정답처리 방식 예시 <br />
            문제의답: Sign 정답처리: sign, SIGN, 사인
          </DescText>
          <StartButton onClick={() => setGameStarted(true)}>
            Music Start
          </StartButton>
        </StartArea>
      ) : (
        <div>
          <QuizStatus>
            문제 {currentQuizIndex} / {totalQuizzes}
          </QuizStatus>
          {!feedback && (
            <CircularProgressContainer>
              <CircularProgressBar progress={(timeLeft / 10) * 100}>
                <PlayPauseButton
                  src={isPaused ? "/img/play.png" : "/img/pause.png"}
                  alt="Play/Pause"
                  onClick={handlePauseResume}
                />
              </CircularProgressBar>
              <TimeText>남은시간 : {timeLeft}s</TimeText>
            </CircularProgressContainer>
          )}
          {feedback ? (
            <>
              <FeedbackText isCorrect={feedback === "정답!"}>
                {feedback}
              </FeedbackText>
              <Answer>
                정답 : {quiz.name}
                <br />
                가수 : {quiz.artist}
              </Answer>
            </>
          ) : (
            <>
              <Contents>
                <Input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="곡명을 입력하세요"
                />
                <Buttons>
                  <SubmitButton onClick={handleSubmit}>제출</SubmitButton>
                  <SkipButton onClick={handleSkip}>스킵</SkipButton>
                  <Volume>
                    <Icon src="/img/Group.png" onClick={handleVolumeToggle} />
                    {isVolumeVisible && (
                      <VolumeControl
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                      />
                    )}
                  </Volume>
                </Buttons>
              </Contents>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;
