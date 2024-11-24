import React, { useState, useEffect } from "react";
import Quiz from "./pages/QuizPage";
import styled from "styled-components";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #1e1e2f;
  color: white;
  font-family: "Arial", sans-serif;
`;

const Title = styled.h1`
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  color: #ff6f61;
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
    const playlistId = "4cBAqN08C5Vg3ZGSFMVnr8"; // 내 플레이리스트 ID
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // 액세스 토큰 사용
        },
      }
    );

    const data = await response.json();

    // 각 곡의 아티스트 정보 가져오기
    const tracks = await Promise.all(
      data.tracks.items.map(async (item) => {
        const artistId = item.track.artists[0].id;
        const artistResponse = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const artistData = await artistResponse.json();

        return {
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0].name,
          previewUrl: item.track.preview_url,
          genres: artistData.genres || [], // 아티스트의 장르 정보
        };
      })
    );

    const playableTracks = tracks
      .filter((track) => track.previewUrl) // 미리듣기 URL이 있는 곡만 사용
      .sort(() => 0.5 - Math.random()) // 랜덤 정렬
      .slice(0, selectedQuizCount); // 사용자가 선택한 문제 개수만큼 설정

    console.log(
      "Fetched Quiz Data (Song Titles):",
      playableTracks.map((track) => track.name)
    ); // 노래 제목 배열 출력
    setQuizData(playableTracks); // Quiz 데이터로 설정
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
