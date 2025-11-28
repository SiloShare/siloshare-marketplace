#!/bin/bash

# Script para iniciar servidor de forma estável
# Uso: ./start-server.sh

echo "🧹 Limpando processos antigos..."
pkill -9 -f "tsx watch server" 2>/dev/null
pkill -9 -f "pnpm dev" 2>/dev/null
sleep 2

echo "🚀 Iniciando servidor..."
cd /home/ubuntu/siloshare_v2

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

# Iniciar servidor com logs
NODE_ENV=development pnpm dev 2>&1 | tee /tmp/siloshare_server.log &
SERVER_PID=$!

echo "✅ Servidor iniciado (PID: $SERVER_PID)"
echo "📋 Logs em: /tmp/siloshare_server.log"
echo ""
echo "Aguardando servidor inicializar..."
sleep 10

# Verificar se servidor está rodando
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Servidor rodando com sucesso!"
    echo ""
    echo "🌐 URLs:"
    echo "  - Homepage: http://localhost:3000/"
    echo "  - tRPC API: http://localhost:3000/api/trpc"
    echo "  - Health: http://localhost:3000/api/health"
    echo ""
    echo "📋 Para ver logs: tail -f /tmp/siloshare_server.log"
    echo "🛑 Para parar: pkill -f 'tsx watch server'"
else
    echo "❌ Servidor não iniciou corretamente!"
    echo "📋 Verifique os logs: tail -f /tmp/siloshare_server.log"
    exit 1
fi

