"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const WeatherMap = dynamic(
  () => import("@/components/WeatherMap"),
  {
    ssr: false,
  }
);

type Station = {
  stationName: string;
  stationId: string;
  obsTime: string;

  county: string;
  town: string;

  latitude: number | null;
  longitude: number | null;

  weather: string | null;

  temperature: number | null;
  humidity: number | null;
  pressure: number | null;

  windDirection: number | null;
  windSpeed: number | null;

  precipitation: number | null;
};

type WeatherResponse = {
  success: boolean;
  count: number;
  data: Station[];
};

export default function Home() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        const response = await fetch("/api/weather");

        const json: WeatherResponse =
          await response.json();

        if (json.success) {
          setStations(json.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, []);

  const stats = useMemo(() => {
    const temperatures = stations
      .map((station) => station.temperature)
      .filter(
        (value): value is number =>
          value !== null
      );

    const rainValues = stations
      .map((station) => station.precipitation)
      .filter(
        (value): value is number =>
          value !== null
      );

    const windValues = stations
      .map((station) => station.windSpeed)
      .filter(
        (value): value is number =>
          value !== null
      );

    return {
      count: stations.length,

      maxTemp:
        temperatures.length > 0
          ? Math.max(...temperatures)
          : null,

      minTemp:
        temperatures.length > 0
          ? Math.min(...temperatures)
          : null,

      maxRain:
        rainValues.length > 0
          ? Math.max(...rainValues)
          : null,

      maxWind:
        windValues.length > 0
          ? Math.max(...windValues)
          : null,
    };
  }, [stations]);

  const latestTime =
    stations.length > 0
      ? stations[0].obsTime
      : null;

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "#111827",
        overflow: "hidden",
      }}
    >
      <WeatherMap />

      {/* 左側統計面板 */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 1000,

          width: 320,

          background:
            "rgba(17, 24, 39, 0.94)",

          color: "white",

          padding: 20,

          borderRadius: 12,

          boxShadow:
            "0 8px 30px rgba(0,0,0,0.35)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 6,
          }}
        >
          台灣即時氣象
        </h2>

        <div
          style={{
            fontSize: 13,
            color: "#9ca3af",
            lineHeight: 1.6,
          }}
        >
          <div>
            資料來源：
            CWA O-A0003-001
          </div>

          <div>
            測站數量：
            {loading
              ? "載入中..."
              : stats.count}
          </div>

          <div>
            觀測時間：
            {latestTime
              ? new Date(
                  latestTime
                ).toLocaleString(
                  "zh-TW"
                )
              : "N/A"}
          </div>
        </div>

        <hr
          style={{
            borderColor: "#374151",
            marginTop: 14,
            marginBottom: 14,
          }}
        />

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "1fr 1fr",

            gap: 12,
          }}
        >
          <StatCard
            title="最高溫"
            value={
              stats.maxTemp !== null
                ? `${stats.maxTemp.toFixed(
                    1
                  )}°C`
                : "N/A"
            }
          />

          <StatCard
            title="最低溫"
            value={
              stats.minTemp !== null
                ? `${stats.minTemp.toFixed(
                    1
                  )}°C`
                : "N/A"
            }
          />

          <StatCard
            title="最大雨量"
            value={
              stats.maxRain !== null
                ? `${stats.maxRain.toFixed(
                    1
                  )} mm`
                : "N/A"
            }
          />

          <StatCard
            title="最大風速"
            value={
              stats.maxWind !== null
                ? `${stats.maxWind.toFixed(
                    1
                  )} m/s`
                : "N/A"
            }
          />
        </div>
      </div>

      {/* 右側圖層面板 */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 1000,

          width: 210,

          background:
            "rgba(17, 24, 39, 0.94)",

          padding: 15,

          borderRadius: 12,

          color: "white",

          boxShadow:
            "0 8px 30px rgba(0,0,0,0.35)",
        }}
      >
        <h3
          style={{
            marginTop: 0,
          }}
        >
          圖層
        </h3>

        {[
          "🌡️ 氣溫",
          "🌧️ 雨量",
          "💨 風速",
          "💧 濕度",
          "🌤️ 天氣",
          "📍 測站點位",
        ].map((item) => (
          <div
            key={item}
            style={{
              background: "#1f2937",

              marginTop: 8,

              padding: 12,

              borderRadius: 7,

              cursor: "pointer",
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* 左下角溫度色階 */}
      <div
        style={{
          position: "absolute",
          bottom: 25,
          left: 20,
          zIndex: 1000,

          background:
            "rgba(17, 24, 39, 0.9)",

          color: "white",

          padding: "10px 14px",

          borderRadius: 10,

          fontSize: 13,
        }}
      >
        <div>
          🔵 &lt;15°C
        </div>

        <div>
          🟦 15–20°C
        </div>

        <div>
          🟢 20–25°C
        </div>

        <div>
          🟠 25–30°C
        </div>

        <div>
          🔴 ≥30°C
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#1f2937",
        borderRadius: 10,
        padding: 12,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#9ca3af",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}