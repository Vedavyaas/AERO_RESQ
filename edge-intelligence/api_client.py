import os
import requests
import jwt
import time
from typing import Dict, List, Any

PRIVATE_KEY = """-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDaAo9ppe9cvzpl
Pt5aAB10yHdiKUxcAucX6PNdkdv1/qxTA0AsTFYd/LUguZciEsfTD3WUxwD5VemD
jIuOIJiimJ7g3eNXbNQJETDuAGO9Mpb17y+7YEJvgTJbEj9+UG7Vr6AvR8KhAajj
2f3rIxWZPWonlc9R8S32NcHnduuu22zFbaaH+t0FfmKPjdP58YV+741d/eG0bWpr
bnLRvbWEzco56B1M/VlvIb7eCcb8Dp1o3hcDPYylfjDzbMWBddFq8BfRCf7WQo8t
/zgrOGIvQRAH5wdG3/CWnza7F/llMSfD/AtJFz+as5lt5hhHDWCZJmRn/pY9dQwk
aYOhZrN/AgMBAAECggEAAoWBDyHCMPptPHqLq9LQhGdFKjd8EJxf++DP38cuGhxF
9ffVqC2B2XrwxV4gJ168PO6y13OtyTR7LPBVNOGfolHNlKA8Xuh9U1WFkVsjzC5n
nJSVor8sRYnjATam0VkwzvvnCGT2FVKll20QCMYxG8KgFbEf4ry9YVmh0oGHnFAb
6yQDJxQfdmfU8eecAfDTE/ABhXK5yepl/t4JrfbSKTIh1QT9JHdZXCsBxFNxRguy
2K1APfni0jn3byCX/RughaTX27TVjTiVnuI78VCHqls98/qGQHRep+233+/G0VH5
32m8K3r4E4vPTVWnrgq6fpLmt4gMIBV/KUCObyKRgQKBgQD4lwzUY9Wl5ILP0A06
WSbIAyMNodBMBmFltKtkVrV0lPCEJO2I0pay1slTdJ1dhjVHHMvc+DF9bnfp2bIp
Udq+a7td3MCYKattNpyvBeVz5QNhiWgWrtpZ79J7hj6oLKTZR27C/jl4aHWHlQTM
IyAqrT9jdlvubtPGSnySn9za4QKBgQDggiiokdCZkVkBnN3X7Cmi4hpcHrZJItav
2ozVvbviXd2aIC82GPfvCFkd9YLWYe6mjOH1aDex9pbw8orza9oEYgmqO6bdiWue
blCx0274H2FgZ15wmdabR27olDTs4dIm1zI8Ziz09CNws2gMEubzSVH3V185qZty
2rJIPqq6XwKBgDA8t0ubV8DKF6wVlguFcyYKncmuZYnrDwk6RqvAu5M0t3sc407S
dlWbohNkpIiaW0pCRzjInGnXfsNM7+perNCYfRIYnPKp207k8wBvZ3fWr5JEpIMK
SOp8w94eTZg6mX5kAxUpWaOIuY2ml/i4tCwz1AIL3IjmzodCuuuEw8lhAoGBAK8P
DuESghOcsEh/psQdFAI8R82Y7Q5uKfUJd1ObFIvYIVlyyx1lrr4mRkcEDzdXOZ2I
sRCIaRVNcDkFBq/0YxWT1HF2/hA0fUQWRLnEYfz7ixR+xbcLXbnKo4KbPgGPvCwp
FLTf/yIp1BCm8/SmMIt3moBBErGFvP575RRMORgFAoGATOSpOl71DCvC686zipHU
kqtHGS2oveoDYpXkFzsbadcQSDdUT98vTbOT4+4PRL6hvLwZ/lujlHFFL85qnyKm
FayHTIvteBYa/A2O/HIpiRrAQsdBNdRBMDBM1zH55BSPulFiNrvMvRLiFcdoaS87
qmVGRdnmaRwrI/Yezu1FdUg=
-----END PRIVATE KEY-----"""

PUBLIC_KEY = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2gKPaaXvXL86ZT7eWgAd
dMh3YilMXALnF+jzXZHb9f6sUwNALExWHfy1ILmXIhLH0w91lMcA+VXpg4yLjiCY
opie4N3jV2zUCREw7gBjvTKW9e8vu2BCb4EyWxI/flBu1a+gL0fCoQGo49n96yMV
mT1qJ5XPUfEt9jXB53brrttsxW2mh/rdBX5ij43T+fGFfu+NXf3htG1qa25y0b21
hM3KOegdTP1ZbyG+3gnG/A6daN4XAz2MpX4w82zFgXXRavAX0Qn+1kKPLf84Kzhi
L0EQB+cHRt/wlp82uxf5ZTEnw/wLSRc/mrOZbeYYRw1gmSZkZ/6WPXUMJGmDoWaz
fwIDAQAB
-----END PUBLIC KEY-----"""

class ApiClient:
    """
    A client to handle HTTP communication with the aero-cloud backend,
    including self-signed JWT token generation.
    """
    def __init__(self, base_url: str = None, drone_code: str = None):
        self.base_url = base_url or os.getenv("AERO_BACKEND_URL", "http://localhost:8080/api/hardware")
        self.drone_code = drone_code or os.getenv("AERO_DRONE_CODE", "DRONE-001")
        self.session = requests.Session()
        self._update_auth_header()

    def _generate_jwt(self) -> str:
        """
        Generates a JWT token signed with the private key.
        """
        payload = {
            "sub": self.drone_code,
            "roles": ["ROLE_HARDWARE", "ROLE_USER"],
            "iat": int(time.time()),
            "exp": int(time.time()) + 3600 * 24 # 24 hours expiry
        }
        token = jwt.encode(payload, PRIVATE_KEY, algorithm="RS256")
        return token

    def _update_auth_header(self):
        """
        Updates the session headers with a fresh JWT token.
        """
        token = self._generate_jwt()
        self.session.headers.update({
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        })

    def send_single_telemetry(self, statistics: Dict[str, Any]) -> requests.Response:
        """
        Sends a single telemetry reading.
        """
        url = f"{self.base_url}/telemetry/single"
        response = self.session.post(url, json=statistics)
        response.raise_for_status()
        return response

    def send_batch_telemetry(self, statistics_list: List[Dict[str, Any]]) -> requests.Response:
        """
        Sends a batch of telemetry readings.
        """
        url = f"{self.base_url}/telemetry"
        response = self.session.post(url, json=statistics_list)
        response.raise_for_status()
        return response

    def notify_drone_returning(self, drone_code: str) -> requests.Response:
        """
        Notifies the backend that the drone is returning.
        """
        url = f"{self.base_url}"
        params = {"droneCode": drone_code}
        response = self.session.post(url, params=params)
        response.raise_for_status()
        return response

    def notify_drone_reached(self, drone_code: str) -> requests.Response:
        """
        Notifies the backend that the drone has reached its destination.
        """
        url = f"{self.base_url}"
        params = {"droneCode": drone_code}
        response = self.session.patch(url, params=params)
        response.raise_for_status()
        return response
