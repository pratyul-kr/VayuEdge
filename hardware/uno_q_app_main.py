"""UNO Q Linux-side Arduino App Lab program: Bridge sensors -> AetherEdge API."""
import json
import os
import time
from urllib.request import Request, urlopen

from arduino.app_utils import App, Bridge

# This computer's active Ethernet IPv4 address. Override with AETHEREDGE_API
# if the backend computer's address changes or the UNO Q is on another network.
API_BASE = os.environ.get("AETHEREDGE_API", "http://192.168.1.128:8000")
NODE_ID = os.environ.get("AETHEREDGE_NODE", "NODE-01")
INVALID_READING = -9999


def post_telemetry(readings):
    payload = json.dumps({"node_id": NODE_ID, "sensors": readings}).encode("utf-8")
    request = Request(
        f"{API_BASE.rstrip('/')}/api/v1/hardware/telemetry",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(request, timeout=5) as response:
        return json.load(response)


def loop():
    try:
        readings = {
            "MQ7": float(Bridge.call("read_mq7")),
            "MQ135": float(Bridge.call("read_mq135")),
        }
        temperature = int(Bridge.call("read_temperature_c10"))
        humidity = int(Bridge.call("read_humidity_pct10"))
        if temperature != INVALID_READING:
            readings["Temperature"] = temperature / 10.0
        if humidity != INVALID_READING:
            readings["Humidity"] = humidity / 10.0

        result = post_telemetry(readings)
        print("Sensor sample sent:", readings, result)
    except Exception as error:
        print("Sensor upload failed:", error)
    time.sleep(3)


App.run(user_loop=loop)
