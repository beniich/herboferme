#!/bin/bash
# ═══════════════════════════════════════════════════════
# Génération des clés RS256 pour JWT
# Usage: chmod +x generate-keys.sh && ./generate-keys.sh
# ═══════════════════════════════════════════════════════

set -e

KEYS_DIR="./keys"
mkdir -p "$KEYS_DIR"

echo "🔑 Génération de la paire de clés RSA 4096 bits..."

# Clé privée (signe les tokens — NE JAMAIS partager)
openssl genrsa -out "$KEYS_DIR/private.pem" 4096

# Clé publique (vérifie les tokens — peut être partagée)
openssl rsa -in "$KEYS_DIR/private.pem" -pubout -out "$KEYS_DIR/public.pem"

echo "✅ Clés générées dans $KEYS_DIR/"
echo ""
echo "📋 Ajoutez dans votre .env :"
echo ""
echo "JWT_PRIVATE_KEY=\"$(cat $KEYS_DIR/private.pem | awk 'NF {sub(/\r/, ""); printf "%s\\n",$0}')\""
echo ""
echo "JWT_PUBLIC_KEY=\"$(cat $KEYS_DIR/public.pem | awk 'NF {sub(/\r/, ""); printf "%s\\n",$0}')\""
echo ""
echo "⚠️  Ajoutez keys/ dans .gitignore — NE JAMAIS committer les clés privées"

# Sécuriser les permissions
chmod 600 "$KEYS_DIR/private.pem"
chmod 644 "$KEYS_DIR/public.pem"

echo ""
echo "🔒 Permissions sécurisées : private.pem (600), public.pem (644)"
