// Arduino UNO Q STM32 sketch: MQ-7 (A0), MQ-135 (A1), DHT22 data (D2).
// In Arduino App Lab, add the "DHT sensor library by Adafruit" library.
#include <Arduino_RouterBridge.h>
#include <DHT.h>

constexpr int MQ7_PIN = A0;
constexpr int MQ135_PIN = A1;
constexpr int DHT_PIN = 2;
constexpr int DHT_TYPE = DHT22;
constexpr int INVALID_READING = -9999;

DHT dht(DHT_PIN, DHT_TYPE);

int read_mq7() { return analogRead(MQ7_PIN); }
int read_mq135() { return analogRead(MQ135_PIN); }
int read_temperature_c10() {
  float value = dht.readTemperature();
  return isnan(value) ? INVALID_READING : (int)round(value * 10.0f);
}
int read_humidity_pct10() {
  float value = dht.readHumidity();
  return isnan(value) ? INVALID_READING : (int)round(value * 10.0f);
}

void setup() {
  analogReadResolution(14);
  dht.begin();
  Bridge.begin();
  Bridge.provide_safe("read_mq7", read_mq7);
  Bridge.provide_safe("read_mq135", read_mq135);
  Bridge.provide_safe("read_temperature_c10", read_temperature_c10);
  Bridge.provide_safe("read_humidity_pct10", read_humidity_pct10);
}

void loop() {}
