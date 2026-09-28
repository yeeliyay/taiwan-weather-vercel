import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.CWA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "找不到 CWA_API_KEY",
        },
        {
          status: 500,
        }
      );
    }

    const url =
      "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001";

    const response = await fetch(
      `${url}?Authorization=${apiKey}&format=JSON`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `CWA API 錯誤：${response.status}`,
        },
        {
          status: response.status,
        }
      );
    }

    const data = await response.json();

    const stations =
      data?.records?.Station ??
      data?.records?.station ??
      [];

    const result = stations.map((station: any) => {
      const geoInfo =
        station.GeoInfo ??
        station.geoInfo ??
        {};

      const weatherElement =
        station.WeatherElement ??
        station.weatherElement ??
        {};

      const obsTimeData =
        station.ObsTime ??
        station.obsTime;

      const obsTime =
        typeof obsTimeData === "object"
          ? obsTimeData?.DateTime ??
            obsTimeData?.dateTime ??
            null
          : obsTimeData;

      let latitude = null;
      let longitude = null;

      const coordinates =
        geoInfo.Coordinates ??
        geoInfo.coordinates ??
        [];

      if (Array.isArray(coordinates)) {
        for (const item of coordinates) {
          const name =
            item?.CoordinateName ??
            item?.coordinateName ??
            "";

          if (
            name.toUpperCase().includes("WGS84") ||
            name === ""
          ) {
            latitude = Number(
              item?.StationLatitude ??
                item?.stationLatitude ??
                item?.Latitude ??
                item?.latitude
            );

            longitude = Number(
              item?.StationLongitude ??
                item?.stationLongitude ??
                item?.Longitude ??
                item?.longitude
            );

            if (
              Number.isFinite(latitude) &&
              Number.isFinite(longitude)
            ) {
              break;
            }
          }
        }
      }

      const now =
        weatherElement.Now ??
        weatherElement.now ??
        {};

      return {
        stationName:
          station.StationName ??
          station.stationName ??
          null,

        stationId:
          station.StationId ??
          station.StationID ??
          station.stationId ??
          null,

        obsTime,

        county:
          geoInfo.CountyName ??
          geoInfo.countyName ??
          station.CountyName ??
          null,

        town:
          geoInfo.TownName ??
          geoInfo.townName ??
          station.TownName ??
          null,

        latitude:
          Number.isFinite(latitude)
            ? latitude
            : null,

        longitude:
          Number.isFinite(longitude)
            ? longitude
            : null,

        weather:
          weatherElement.Weather ??
          weatherElement.weather ??
          null,

        temperature: toNumber(
          weatherElement.AirTemperature ??
            weatherElement.airTemperature
        ),

        humidity: toNumber(
          weatherElement.RelativeHumidity ??
            weatherElement.relativeHumidity
        ),

        pressure: toNumber(
          weatherElement.AirPressure ??
            weatherElement.airPressure
        ),

        windDirection: toNumber(
          weatherElement.WindDirection ??
            weatherElement.windDirection
        ),

        windSpeed: toNumber(
          weatherElement.WindSpeed ??
            weatherElement.windSpeed
        ),

        precipitation: toNumber(
          now?.Precipitation ??
            now?.precipitation ??
            weatherElement.Precipitation ??
            weatherElement.precipitation
        ),
      };
    });

    return NextResponse.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "未知錯誤",
      },
      {
        status: 500,
      }
    );
  }
}

function toNumber(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-" ||
    value === "X" ||
    value === "-99" ||
    value === "-999"
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}