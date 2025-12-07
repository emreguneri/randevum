#!/bin/bash

# Firestore Rules'ı otomatik olarak deploy eden script
# Kullanım: ./deploy-rules.sh

echo "🔥 Firestore Rules deploy ediliyor..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Rules başarıyla deploy edildi!"
else
    echo "❌ Deploy başarısız oldu. Firebase'e login olduğunuzdan emin olun: firebase login"
fi

