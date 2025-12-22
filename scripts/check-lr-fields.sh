#!/bin/bash

# Fetch asset list
echo "Fetching assets..."
curl -s "https://lightroom.adobe.com/v2/spaces/251ce0b2fba5439e94397e33ab95348c/assets?subtype=image&limit=1" \
  -H "User-Agent: Mozilla/5.0" \
  -H "Accept: application/json" \
  -H "x-api-key: LightroomMobileWeb1" > /tmp/lr-list.json

# Remove the while(1){} prefix
sed -i '' 's/^while (1) {}//' /tmp/lr-list.json 2>/dev/null || sed -i 's/^while (1) {}//' /tmp/lr-list.json

# Extract first asset ID
ASSET_ID=$(python3 -c "import json; d=json.load(open('/tmp/lr-list.json')); print(d['resources'][0]['asset']['id'])")
echo "Asset ID: $ASSET_ID"

# Fetch asset details
echo "Fetching asset details..."
curl -s "https://lightroom.adobe.com/v2/spaces/251ce0b2fba5439e94397e33ab95348c/assets/$ASSET_ID" \
  -H "User-Agent: Mozilla/5.0" \
  -H "Accept: application/json" \
  -H "x-api-key: LightroomMobileWeb1" > /tmp/lr-asset.json

sed -i '' 's/^while (1) {}//' /tmp/lr-asset.json 2>/dev/null || sed -i 's/^while (1) {}//' /tmp/lr-asset.json

echo ""
echo "=== PAYLOAD FIELDS ==="
python3 -c "
import json
d = json.load(open('/tmp/lr-asset.json'))
payload = d.get('payload', {})
print('Available keys:', list(payload.keys()))
print()
for k, v in payload.items():
    if isinstance(v, dict):
        print(f'{k}: {json.dumps(v, indent=2)[:500]}')
    else:
        print(f'{k}: {v}')
    print()
"
