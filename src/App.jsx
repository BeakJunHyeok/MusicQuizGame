import React, { useState, useEffect } from "react";
import Quiz from "./pages/QuizPage";

const App = () => {
  const [token, setToken] = useState("");
  const [quizData, setQuizData] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

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
    const playlistId = "37i9dQZF1DXcBWIGoYBM5M"; // K-POP Daebak (Spotify 공식 ID)
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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

    // K-POP 장르가 포함된 곡만 필터링
    const kpopTracks = tracks
      .filter((track) => track.genres.includes("k-pop")) // K-POP 장르 포함 여부 확인
      .filter((track) => track.previewUrl) // 미리듣기 URL이 있는 곡만 사용
      .sort(() => 0.5 - Math.random()) // 랜덤 정렬
      .slice(0, 10); // 상위 10개 선택

    setQuizData(kpopTracks); // Quiz 데이터로 설정
  };
  useEffect(() => {
    getAccessToken(); // Access Token 가져오기
  }, []);

  useEffect(() => {
    if (token) fetchQuizData(); // Quiz 데이터 가져오기
  }, [token]);

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

  return (
    <div>
      <h1>K-POP 노래 맞추기</h1>
      {isGameOver ? (
        <div>
          <h2>게임 종료!</h2>
          <p>
            점수: {score} / {quizData.length}
          </p>
        </div>
      ) : quizData.length > 0 ? (
        <Quiz quiz={quizData[currentQuizIndex]} onAnswer={handleAnswer} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default App;
