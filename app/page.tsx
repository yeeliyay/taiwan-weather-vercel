"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const WeatherMap = dynamic(
  () => import("@/components/WeatherMap"),
  {
    ssr: false,
  }
);

export type LayerType =
  | "temperature"
  | "rain"
  | "wind"
  | "humidity";

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

const layers: {
  key: LayerType;
  label: string;
  icon: string;
}[] = [
  {
    key: "temperature",
    label: "氣溫",
    icon: "🌡️",
  },
  {
    key: "rain",
    label: "雨量",
    icon: "🌧️",
  },
  {
    key: "wind",
    label: "風速",
    icon: "💨",
  },
  {
    key: "humidity",
    label: "濕度",
    icon: "💧",
  },
];

export default function Home() {
  const [stations, setStations] =
    useState<Station[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [activeLayer, setActiveLayer] =
    useState<LayerType>("temperature");

  useEffect(() => {
    async function loadWeather() {
      try {
        const response =
          await fetch("/api/weather");

        const json: WeatherResponse =
          await response.json();

        if (json.success) {
          setStations(json.data);
        }
      } catch (error) {
        console.error(
          "讀取氣象資料失敗：",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, []);

  const stats = useMemo(() => {
    const temperatures = stations
      .map(
        (station) =>
          station.temperature
      )
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

    const rainValues = stations
      .map(
        (station) =>
          station.precipitation
      )
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

    const windValues = stations
      .map(
        (station) =>
          station.windSpeed
      )
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

    const humidityValues =
      stations
        .map(
          (station) =>
            station.humidity
        )
        .filter(
          (
            value
          ): value is number =>
            value !== null
        );

    return {
      count: stations.length,

      maxTemp:
        temperatures.length > 0
          ? Math.max(
              ...temperatures
            )
          : null,

      minTemp:
        temperatures.length > 0
          ? Math.min(
              ...temperatures
            )
          : null,

      maxRain:
        rainValues.length > 0
          ? Math.max(
              ...rainValues
            )
          : null,

      maxWind:
        windValues.length > 0
          ? Math.max(
              ...windValues
            )
          : null,

      maxHumidity:
        humidityValues.length > 0
          ? Math.max(
              ...humidityValues
            )
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
      <WeatherMap
        activeLayer={
          activeLayer
        }
      />

      {/* 左側資訊面板 */}
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

          backdropFilter:
            "blur(8px)",
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
            lineHeight: 1.7,
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
            border: "none",
            borderTop:
              "1px solid #374151",
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

      {/* 右側圖層切換 */}
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

          backdropFilter:
            "blur(8px)",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: 10,
          }}
        >
          圖層
        </h3>

        {layers.map(
          (layer) => (
            <button
              key={layer.key}
              onClick={() =>
                setActiveLayer(
                  layer.key
                )
              }
              style={{
                width: "100%",

                background:
                  activeLayer ===
                  layer.key
                    ? "#2563eb"
                    : "#1f2937",

                color: "white",

                border:
                  activeLayer ===
                  layer.key
                    ? "1px solid #60a5fa"
                    : "1px solid #374151",

                marginTop: 8,

                padding:
                  "12px 14px",

                borderRadius: 8,

                cursor: "pointer",

                textAlign: "left",

                fontSize: 15,

                transition:
                  "0.2s",
              }}
            >
              <span
                style={{
                  marginRight: 8,
                }}
              >
                {layer.icon}
              </span>

              {layer.label}
            </button>
          )
        )}
      </div>

      {/* 圖例 */}
      <Legend
        activeLayer={
          activeLayer
        }
      />
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
        border:
          "1px solid #374151",
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

function Legend({
  activeLayer,
}: {
  activeLayer: LayerType;
}) {
  const legendData = {
    temperature: {
      title: "氣溫",
      unit: "°C",
      items: [
        {
          color: "#2563eb",
          text: "< 15",
        },
        {
          color: "#38bdf8",
          text: "15 - 20",
        },
        {
          color: "#22c55e",
          text: "20 - 25",
        },
        {
          color: "#f59e0b",
          text: "25 - 30",
        },
        {
          color: "#ef4444",
          text: "≥ 30",
        },
      ],
    },

    rain: {
      title: "雨量",
      unit: "mm",
      items: [
        {
          color: "#d1d5db",
          text: "0",
        },
        {
          color: "#60a5fa",
          text: "0 - 10",
        },
        {
          color: "#2563eb",
          text: "10 - 30",
        },
        {
          color: "#7c3aed",
          text: "30 - 50",
        },
        {
          color: "#dc2626",
          text: "≥ 50",
        },
      ],
    },

    wind: {
      title: "風速",
      unit: "m/s",
      items: [
        {
          color: "#bbf7d0",
          text: "< 2",
        },
        {
          color: "#4ade80",
          text: "2 - 5",
        },
        {
          color: "#facc15",
          text: "5 - 10",
        },
        {
          color: "#f97316",
          text: "10 - 15",
        },
        {
          color: "#dc2626",
          text: "≥ 15",
        },
      ],
    },

    humidity: {
      title: "濕度",
      unit: "%",
      items: [
        {
          color: "#fde68a",
          text: "< 40",
        },
        {
          color: "#86efac",
          text: "40 - 60",
        },
        {
          color: "#67e8f9",
          text: "60 - 80",
        },
        {
          color: "#2563eb",
          text: "≥ 80",
        },
      ],
    },
  };

  const current =
    legendData[activeLayer];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 25,
        left: 20,
        zIndex: 1000,

        minWidth: 180,

        background:
          "rgba(17, 24, 39, 0.94)",

        color: "white",

        padding: "12px 14px",

        borderRadius: 10,

        fontSize: 13,

        boxShadow:
          "0 8px 25px rgba(0,0,0,0.3)",

        backdropFilter:
          "blur(8px)",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {current.title}
        {" "}
        ({current.unit})
      </div>

      {current.items.map(
        (item) => (
          <div
            key={item.text}
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 8,
              marginTop: 5,
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius:
                  "50%",
                background:
                  item.color,
                border:
                  "1px solid rgba(255,255,255,0.6)",
                display:
                  "inline-block",
              }}
            />

            <span>
              {item.text}
            </span>
          </div>
        )
      )}
    </div>
  );
}