"use client";

import { PurchaseWithDetails } from "@/backend/type/type";
import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

interface SpendingChartProps {
  purchases: PurchaseWithDetails[];
}

const processDataForChart = (purchases: PurchaseWithDetails[]) => {
  const monthlyTotals: { [key: string]: number } = {};

  purchases.forEach((p) => {
    const month = new Date(p.date).toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    const total = Number(p.totalValue);
    if (monthlyTotals[month]) {
      monthlyTotals[month] += total;
    } else {
      monthlyTotals[month] = total;
    }
  });

  // Ordena os meses cronologicamente
  const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
    const [monthA, yearA] = a.split(" de ");
    const [monthB, yearB] = b.split(" de ");
    const dateA = new Date(`${monthA} 1, ${yearA}`);
    const dateB = new Date(`${monthB} 1, ${yearB}`);
    return dateA.getTime() - dateB.getTime();
  });

  const labels = sortedMonths.map(
    (month) => month.charAt(0).toUpperCase() + month.slice(1)
  );
  const data = sortedMonths.map((month) => monthlyTotals[month].toFixed(2));

  return { labels, data };
};

export function SpendingChart({ purchases }: SpendingChartProps) {
  const chartData = useMemo(() => processDataForChart(purchases), [purchases]);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: chartData.labels,
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        axisLabel: {
          formatter: "R$ {value}",
        },
      },
    ],
    series: [
      {
        name: "Total Gasto",
        type: "bar",
        barWidth: "60%",
        data: chartData.data,
        itemStyle: {
          color: "#16a34a", // Verde
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 400 }} />;
}
