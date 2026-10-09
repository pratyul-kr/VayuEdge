"""Send one UNO Q sensor sample to the AetherEdge backend over the LAN.

Call post_readings() from the UNO Q Linux-side Python app after reading your
sensors (for example, values received from an MCU sketch through Arduino
Bridge). This script intentionally does not assume a particular sensor kit.
"""

import argparse
import json
from urllib.request import Request, urlopen


def post_readings(api_base: str, readings: dict[str, float], node_id: str = "NODE-01") -> dict:
    payload = json.dumps({"node_id": node_id, "sensors": readings}).encode("utf-8")
    request = Request(
        f"{api_base.rstrip('/')}/api/v1/hardware/telemetry",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(request, timeout=5) as response:
        return json.load(response)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--api", required=True, help="Backend base URL, e.g. http://192.168.1.20:8000")
    parser.add_argument("--node", default="NODE-01")
    parser.add_argument("--readings-json", required=True, help='Example: {"PM2.5":12.4,"Temperature":25.1}')
    args = parser.parse_args()
    result = post_readings(args.api, json.loads(args.readings_json), args.node)
    print(json.dumps(result))
