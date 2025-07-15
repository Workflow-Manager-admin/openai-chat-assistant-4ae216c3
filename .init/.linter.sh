#!/bin/bash
cd /home/kavia/workspace/code-generation/openai-chat-assistant-4ae216c3/frontend_chatbot
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

