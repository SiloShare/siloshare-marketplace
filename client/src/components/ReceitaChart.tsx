import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface ReceitaChartProps {
  data: Array<{
    month: string;
    receita: number;
    isProjection?: boolean;
  }>;
  formatCurrency: (value: number) => string;
}

export function ReceitaChart({ data, formatCurrency }: ReceitaChartProps) {
  // Separar dados históricos e projeções
  const historicalData = data.filter(d => !d.isProjection);
  const projectionData = data.filter(d => d.isProjection);
  
  // Combinar para o gráfico (último histórico + projeções)
  const chartData = [
    ...historicalData,
    ...projectionData,
  ];

  // Encontrar índice onde começa a projeção
  const projectionStartIndex = historicalData.length - 1;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
          labelFormatter={(label, payload) => {
            if (payload && payload[0]?.payload?.isProjection) {
              return `${label} (Projeção)`;
            }
            return label;
          }}
        />
        
        {/* Linha de referência vertical separando histórico de projeção */}
        {projectionData.length > 0 && (
          <ReferenceLine
            x={historicalData[historicalData.length - 1].month}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            label={{ value: "Projeção →", position: "top", fill: "#64748b" }}
          />
        )}

        {/* Linha de receita histórica (sólida, verde) */}
        <Line
          type="monotone"
          dataKey="receita"
          stroke="#22c55e"
          strokeWidth={2}
          dot={(props: any) => {
            const { cx, cy, index } = props;
            const isProjection = index > projectionStartIndex;
            return (
              <circle
                cx={cx}
                cy={cy}
                r={4}
                fill={isProjection ? "#94a3b8" : "#22c55e"}
                stroke={isProjection ? "#94a3b8" : "#22c55e"}
                strokeWidth={2}
              />
            );
          }}
          activeDot={{ r: 6 }}
          strokeDasharray={(props: any) => {
            // Não podemos acessar o index aqui diretamente
            // Vamos usar uma abordagem diferente
            return "0";
          }}
        />

        {/* Linha de projeção (tracejada, cinza) */}
        {projectionData.length > 0 && (
          <Line
            type="monotone"
            data={[historicalData[historicalData.length - 1], ...projectionData]}
            dataKey="receita"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "#94a3b8", r: 4 }}
            activeDot={{ r: 6 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
