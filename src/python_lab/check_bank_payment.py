import requests

url = "https://api.pagseguro.com/checkouts"

payload = {
    "items": {
        "reference_id": "15973246",
        "name": "Tenis",
        "quantity": 1,
        "unit_amount": 120
    },
    "reference_id": "0271312",
    "expiration_date": "2023-09-19",
    "customer_modifiable": True
}
headers = {
    "accept": "application/json",
    "Content-type": "application/json",
    ""
    "Authorization": "Bearer d93e35bb-c37e-486e-a70c-a479f2f79e7d3eae1c2640ec8ae6b00caade575306a8a211-db38-4181-afc2-411146b08cc9"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)