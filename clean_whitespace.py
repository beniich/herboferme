import os

files = [
    "herbute-backend/src/services/socketService.ts",
    "herbute-backend/src/services/sagaConsumer.ts",
    "herbute-backend/src/services/notificationService.ts",
    "herbute-backend/src/scripts/performance-diagnostic.ts",
    "herbute-backend/src/middleware/errorHandler.ts",
    "herbute-backend/src/data/db-generator.ts"
]

# Irregular whitespace characters to replace with standard space
# We use bytes to be safe
TO_REPLACE = [
    b'\xc2\xa0', # Non-breaking space
    b'\xe2\x80\x8b', # Zero-width space
]

for filepath in files:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue

    with open(filepath, 'rb') as f:
        content = f.read()

    new_content = content
    for target in TO_REPLACE:
        new_content = new_content.replace(target, b' ')

    if new_content != content:
        with open(filepath, 'wb') as f:
            f.write(new_content)
        print(f"Cleaned {filepath}")
    else:
        print(f"No changes for {filepath}")
