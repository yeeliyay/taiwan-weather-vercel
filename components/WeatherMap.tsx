"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useState } from "react";


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


function getColor(temp: number | null) {

  if (temp === null) {
    return "#6b7280";
  }

  if (temp < 15) {
    return "#2563eb";
  }

  if (temp < 20) {
    return "#38bdf8";
  }

  if (temp < 25) {
    return "#22c55e";
  }

  if (temp < 30) {
    return "#f59e0b";
  }

  return "#ef4444";
}


export default function WeatherMap() {

  const [stations, setStations] =
    useState<Station[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {

    async function loadWeather() {

      try {

        setLoading(true);

        const response = await fetch(
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

        setStations(json.data);

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


  const validStations = useMemo(() => {

    return stations.filter(
      (station) =>
        station.latitude !== null &&
        station.longitude !== null
    );

  }, [stations]);


  if (loading) {

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
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
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
          color: "white",
        }}
      >
        {error}
      </div>
    );
  }


  return (
    <MapContainer
      center={[23.7, 121]}
      zoom={7}
      style={{
        width: "100%",
        height: "100%",
      }}
    >

      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      {validStations.map((station) => (

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
            color: "#ffffff",
            weight: 1,

            fillColor: getColor(
              station.temperature
            ),

            fillOpacity: 0.9,
          }}
        >

          <Popup>

            <div
              style={{
                minWidth: 180,
              }}
            >

              <strong>
                {station.stationName}
              </strong>

              <br />

              {station.county}
              {" "}
              {station.town}

              <hr />

              🌡 氣溫：
              {
                station.temperature
                ?? "N/A"
              }
              °C

              <br />

              💧 濕度：
              {
                station.humidity
                ?? "N/A"
              }
              %

              <br />

              🌧 雨量：
              {
                station.precipitation
                ?? "N/A"
              }
              mm

              <br />

              💨 風速：
              {
                station.windSpeed
                ?? "N/A"
              }
              m/s

              <br />

              🔵 氣壓：
              {
                station.pressure
                ?? "N/A"
              }
              hPa

              <br />

              🌤 天氣：
              {
                station.weather
                ?? "N/A"
              }

              <br />

              <small>
                {station.obsTime}
              </small>

            </div>

          </Popup>

        </CircleMarker>

      ))}

    </MapContainer>
  );
}