import React, { useState, useEffect } from "react";
import Quiz from "./pages/QuizPage";
import styled from "styled-components";
import SpotifyAuth from "./SpotifyAuth";
const AppContainer = styled.div`
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #1e1e2f;
  color: white;
  font-family: "Arial", sans-serif;
  @media (max-width: 430px) {
    width: 100%;
    height: 100vh;
  }
`;

const Title = styled.h1`
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  color: #ff6f61;
  @media (max-width: 430px) {
    font-size: 32px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
`;

const GameOverContainer = styled.div`
  text-align: center;
`;

const ScoreText = styled.p`
  font-size: 1.5rem;
  margin-top: 1rem;
  font-weight: bold;
`;

const Button = styled.button`
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
    background: #ff877a;
  }
  @media (max-width: 430px) {
    padding: 18px;
  }
`;

const App = () => {
  const [token, setToken] = useState("");
  const [quizData, setQuizData] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedQuizCount, setSelectedQuizCount] = useState(0);

  const getAccessToken = async () => {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();
    setToken(data.access_token);
  };

  const fetchQuizData = async () => {
    const playlistId = "4cBAqN08C5Vg3ZGSFMVnr8"; // 플레이리스트 ID
    const tracks = [];
    let offset = 0;
    const limit = 100;

    // 전체 트랙 가져오기
    while (true) {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        console.error("No items in playlist response:", data);
        break; // 더 이상 가져올 트랙이 없으면 중단
      }

      tracks.push(...data.items);

      if (data.items.length < limit) break; // 더 이상 가져올 트랙이 없으면 중단
      offset += limit; // 다음 요청의 시작점 설정
    }

    // console.log("Fetched Tracks:", tracks);

    // 랜덤 선택
    const shuffledTracks = tracks.sort(() => 0.5 - Math.random()); // 전체 트랙을 랜덤 정렬
    const selectedTracks = shuffledTracks.slice(0, selectedQuizCount); // 문제 개수만큼 선택

    // 아티스트 정보와 곡 정보 가져오기
    const trackDetails = selectedTracks.map((item) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists[0]?.name || "Unknown Artist",
    }));

    // console.log(
    //   "Fetched Song Titles for Quiz:",
    //   trackDetails.map((track) => `${track.name}`)
    // ); // 디버깅용 출력

    // Quiz 데이터 설정
    setQuizData(trackDetails);
  };

  useEffect(() => {
    getAccessToken(); // Access Token 가져오기
  }, []);

  useEffect(() => {
    if (token && selectedQuizCount > 0) {
      fetchQuizData(); // Quiz 데이터 가져오기
    }
  }, [token, selectedQuizCount]);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    const nextIndex = currentQuizIndex + 1;
    if (nextIndex < quizData.length) {
      setCurrentQuizIndex(nextIndex);
    } else {
      setIsGameOver(true);
    }
  };

  const handleQuizCountSelection = (count) => {
    setSelectedQuizCount(count);
  };

  const resetGame = () => {
    setSelectedQuizCount(0);
    setScore(0);
    setCurrentQuizIndex(0);
    setIsGameOver(false);
    setQuizData([]);
  };

  return (
    <AppContainer>
      <Title>K-POP 노래 맞추기</Title>
      {!selectedQuizCount ? (
        <div>
          <Title>몇 문제를 풀고 싶나요?</Title>
          <ButtonContainer>
            {[10, 20, 30, 40, 50].map((count) => (
              <Button
                key={count}
                onClick={() => handleQuizCountSelection(count)}
              >
                {count}문제
              </Button>
            ))}
          </ButtonContainer>
        </div>
      ) : isGameOver ? (
        <GameOverContainer>
          <h2>게임 종료!</h2>
          <Button onClick={resetGame}>홈으로</Button>
          <ScoreText>
            점수: {score} / {quizData.length}
          </ScoreText>
        </GameOverContainer>
      ) : quizData.length > 0 ? (
        <Quiz
          quiz={quizData[currentQuizIndex]}
          currentQuizIndex={currentQuizIndex + 1}
          totalQuizzes={quizData.length}
          onAnswer={handleAnswer}
        />
      ) : (
        <p>Loading...</p>
      )}
    </AppContainer>
  );
};

export default App;
