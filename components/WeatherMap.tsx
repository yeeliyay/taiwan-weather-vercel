"use client";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  LayerType,
} from "@/app/page";

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

type WeatherMapProps = {
  activeLayer: LayerType;
};

export default function WeatherMap({
  activeLayer,
}: WeatherMapProps) {
  const [stations, setStations] =
    useState<Station[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true);

        const response =
          await fetch(
            "/api/weather"
          );

        if (!response.ok) {
          throw new Error(
            `API 錯誤：${response.status}`
          );
        }

        const json: WeatherResponse =
          await response.json();

        if (!json.success) {
          throw new Error(
            "CWA 資料取得失敗"
          );
        }

        setStations(
          json.data
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "讀取氣象資料失敗"
        );
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, []);

  const validStations =
    useMemo(() => {
      return stations.filter(
        (station) =>
          station.latitude !==
            null &&
          station.longitude !==
            null
      );
    }, [stations]);

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          background:
            "#111827",
          color: "white",
          fontSize: 20,
        }}
      >
        正在載入中央氣象署資料...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          background:
            "#111827",
          color: "white",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <MapContainer
      center={[
        23.7,
        121,
      ]}
      zoom={7}
      minZoom={6}
      maxZoom={13}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {validStations.map(
        (station) => (
          <CircleMarker
            key={
              station.stationId
            }
            center={[
              station.latitude!,
              station.longitude!,
            ]}
            radius={8}
            pathOptions={{
              color:
                "#ffffff",
              weight: 1,
              fillColor:
                getMarkerColor(
                  station,
                  activeLayer
                ),
              fillOpacity:
                0.9,
            }}
          >
            <Popup>
              <div
                style={{
                  minWidth: 210,
                  lineHeight: 1.6,
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight:
                      700,
                    marginBottom:
                      4,
                  }}
                >
                  {
                    station.stationName
                  }
                </div>

                <div
                  style={{
                    color:
                      "#555",
                    marginBottom:
                      8,
                  }}
                >
                  {
                    station.county
                  }
                  {" "}
                  {
                    station.town
                  }
                </div>

                <div>
                  🌤 天氣：
                  {station.weather ??
                    "N/A"}
                </div>

                <div>
                  🌡 氣溫：
                  {formatValue(
                    station.temperature,
                    "°C"
                  )}
                </div>

                <div>
                  💧 濕度：
                  {formatValue(
                    station.humidity,
                    "%"
                  )}
                </div>

                <div>
                  🌧 雨量：
                  {formatValue(
                    station.precipitation,
                    " mm"
                  )}
                </div>

                <div>
                  💨 風速：
                  {formatValue(
                    station.windSpeed,
                    " m/s"
                  )}
                </div>

                <div>
                  🧭 風向：
                  {formatValue(
                    station.windDirection,
                    "°"
                  )}
                </div>

                <div>
                  🔵 氣壓：
                  {formatValue(
                    station.pressure,
                    " hPa"
                  )}
                </div>

                <hr />

                <div
                  style={{
                    fontSize: 11,
                    color:
                      "#666",
                  }}
                >
                  觀測時間：
                  <br />
                  {
                    station.obsTime
                  }
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      )}
    </MapContainer>
  );
}

function getMarkerColor(
  station: Station,
  activeLayer: LayerType
) {
  if (
    activeLayer ===
    "temperature"
  ) {
    const value =
      station.temperature;

    if (value === null) {
      return "#6b7280";
    }

    if (value < 15) {
      return "#2563eb";
    }

    if (value < 20) {
      return "#38bdf8";
    }

    if (value < 25) {
      return "#22c55e";
    }

    if (value < 30) {
      return "#f59e0b";
    }

    return "#ef4444";
  }

  if (
    activeLayer ===
    "rain"
  ) {
    const value =
      station.precipitation;

    if (value === null) {
      return "#6b7280";
    }

    if (value === 0) {
      return "#d1d5db";
    }

    if (value < 10) {
      return "#60a5fa";
    }

    if (value < 30) {
      return "#2563eb";
    }

    if (value < 50) {
      return "#7c3aed";
    }

    return "#dc2626";
  }

  if (
    activeLayer ===
    "wind"
  ) {
    const value =
      station.windSpeed;

    if (value === null) {
      return "#6b7280";
    }

    if (value < 2) {
      return "#bbf7d0";
    }

    if (value < 5) {
      return "#4ade80";
    }

    if (value < 10) {
      return "#facc15";
    }

    if (value < 15) {
      return "#f97316";
    }

    return "#dc2626";
  }

  if (
    activeLayer ===
    "humidity"
  ) {
    const value =
      station.humidity;

    if (value === null) {
      return "#6b7280";
    }

    if (value < 40) {
      return "#fde68a";
    }

    if (value < 60) {
      return "#86efac";
    }

    if (value < 80) {
      return "#67e8f9";
    }

    return "#2563eb";
  }

  return "#6b7280";
}

function formatValue(
  value: number | null,
  unit: string
) {
  if (value === null) {
    return "N/A";
  }

  return `${value}${unit}`;
}