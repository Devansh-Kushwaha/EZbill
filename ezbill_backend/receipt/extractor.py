import re

def extract_amount(text):
    lines = text.splitlines()
    amounts = []
    keywords = ['total', 'amount', 'grand total', 'balance', 'sub total', 'received']
    for line in lines:
        # Normalize and lower the line
        l = line.lower()

        # if any(keyword in l for keyword in ['total', 'amount', 'grand total', 'balance', 'sub total', 'received']):
            # Look for amount pattern in the line
        match=False
        for keyword in keywords:
            if keyword in l:
                match=True
                break
        if match:
            found = re.findall(r'[\d,]+\.\d{2}', line)
            if found:
                for amt in found:
                    amounts.append(float(amt.replace(',', '')))

    # fallback if above fails
    if not amounts:
        fallback = re.findall(r'[\d,]+\.\d{2}', text)
        if fallback:
            amounts = [float(f.replace(',', '')) for f in fallback]

    return max(amounts) if amounts else 0.0
