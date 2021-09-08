import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Card } from 'src/components/Card';
import { CardContent } from 'src/components/Card/CardContent';
import { CardHeader } from 'src/components/Card/CardHeader';
import TextError from 'src/components/Errors/TextError';
import TextLoader from 'src/components/Loaders/TextLoader';
import { COINGECKO_PLATFORM_IDENTIFIER } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { getMarketChartByContractAddr } from 'src/services/coingeckoApi';

import 'chartjs-adapter-luxon';

const getBestDecimalPlaces = (values) => {
  const nums = values.map((x) => x.value);
  const min = Math.min(...nums);

  if (min <= 0.0001) return 5;
  else if (min <= 0.001) return 4;
  else if (min <= 0.01) return 3;
  else return 2;
};

const getOptions = () => {
  return {
    layout: {
      padding: {
        left: 5,
        right: 5,
        top: 20,
        bottom: 0,
      },
    },
    scales: {
      x: {
        type: 'time',
        ticks: {
          beginAtZero: true,
        },
        grid: {
          display: false,
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          callback: (value, index, values) => `$${value.toFixed(getBestDecimalPlaces(values))}`,
        },
        grid: {
          drawBorder: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        intersect: false,
        callbacks: {
          title: () => null,
          label: (data) => `$${data.formattedValue}`,
        },
      },
    },
  };
};

export default function TokenChart(props) {
  // app state
  const { chainId } = useActiveWeb3React();

  // props
  const { tokenAddress } = props;

  // component state
  const [isLoading, setIsLoading] = useState(true);
  const [isErrored, setIsErrored] = useState(false);

  const [marketChartData, setMarketChartData] = useState(null);

  const refreshMarketChart = async () => {
    try {
      const { data: marketChartData } = await getMarketChartByContractAddr(COINGECKO_PLATFORM_IDENTIFIER[chainId], tokenAddress);
      setMarketChartData(marketChartData);
    } catch (err) {
      setIsErrored(true);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const chartLabels = useMemo(() => {
    if (!marketChartData || !marketChartData?.prices) return [];

    const x = [];
    for (let i = 0; i < marketChartData.prices.length; i++) {
      x.push(marketChartData.prices[i][0]);
    }
    return x;
  }, [marketChartData]);

  const chartNums = useMemo(() => {
    if (!marketChartData || !marketChartData?.prices) return [];

    const y = [];
    for (let i = 0; i < marketChartData.prices.length; i++) {
      y.push(marketChartData.prices[i][1]);
    }
    return y;
  }, [marketChartData]);

  useEffect(() => {
    refreshMarketChart();
  }, [chainId, tokenAddress]);

  return (
    <Card>
      <CardHeader title="Price Chart" />
      <CardContent px="2">
        {isLoading && <TextLoader mt="22%" />}
        {!isLoading && (
          <>
            {!isErrored ? (
              <Line
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    data: chartNums,
                    fill: false,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderColor: '#16cc89',
                    tension: 0.4,
                    pointBorderColor: 'rgba(0, 0, 0, 0)',
                    pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                    pointHoverBackgroundColor: '#16cc89',
                    pointHoverBorderColor: '#16cc89',
                  },
                ],
              }}
              options={getOptions()}
            />
            ) : (
              <TextError text="No data found" mt="22%" />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
