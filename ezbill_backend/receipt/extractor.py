import re

def extract_amount(text):
    lines = text.splitlines() 
    amounts = []
    keywords = ['total', 'amount', 'grand total', 'balance', 'sub total', 'received']
    
    # Loop over each line to search for keywords and amounts
    for line in lines:
        l = line.lower()
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

    # Fallback: If no keyword-matched amounts found, extract all amounts in the entire text
    if not amounts:
        fallback = re.findall(r'[\d,]+\.\d{2}', text)
        if fallback:
            amounts = [float(f.replace(',', '')) for f in fallback]

    return max(amounts) if amounts else 0.0
