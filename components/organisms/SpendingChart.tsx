import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useThemeStore } from '../../stores/themeStore';
import { lightTheme, darkTheme, spacing, typography } from '../../constants/theme';
import { Card } from '../atoms/Card';

const screenWidth = Dimensions.get('window').width;

interface SpendingChartProps {
  data: any[];
  type: 'line' | 'pie';
  title: string;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({
  data,
  type,
  title,
}) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `${theme.text}${Math.round(opacity * 255).toString(16)}`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.border,
      strokeWidth: 1,
    },
  };

  const renderLineChart = () => {
    if (!data || data.length === 0) {
      return (
        <Text style={[styles.noData, { color: theme.textMuted }]}>
          No data available
        </Text>
      );
    }

    return (
      <LineChart
        data={{
          labels: data.map(item => item.label),
          datasets: [
            {
              data: data.map(item => item.value),
            },
          ],
        }}
        width={screenWidth - 64}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    );
  };

  const renderPieChart = () => {
    if (!data || data.length === 0) {
      return (
        <Text style={[styles.noData, { color: theme.textMuted }]}>
          No data available
        </Text>
      );
    }

    const pieData = data.map((item, index) => ({
      name: item.label,
      value: item.value,
      color: item.color || `hsl(${(index * 60) % 360}, 70%, 50%)`,
      legendFontColor: theme.text,
      legendFontSize: 12,
    }));

    return (
      <PieChart
        data={pieData}
        width={screenWidth - 64}
        height={220}
        chartConfig={chartConfig}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 10]}
        absolute
      />
    );
  };

  return (
    <Card padding="md" style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <View style={styles.chartContainer}>
        {type === 'line' ? renderLineChart() : renderPieChart()}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  noData: {
    ...typography.body,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});