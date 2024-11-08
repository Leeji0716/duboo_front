"use client";

import axios from 'axios';
import { useEffect, useState } from "react";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface BoltResponseDTO {
  num: number;
  distance: number;
  temperature: number;
  date: number;
}

interface DiffResponseDTO {
  num: number;
  ref: number;
  las: number;
  diff: number;
}

export default function Home() {
  const [floor, setFloor] = useState(1);
  const [num, setNum] = useState(1);
  const [numList, setNumList] = useState([]);
  const [boltList, setBoltList] = useState<BoltResponseDTO[]>([]);
  const [diffList, setDiffList] = useState<DiffResponseDTO[]>([]);
  const [first, setFirst] = useState<DiffResponseDTO[]>([]);
  const [secound, setSecound] = useState<DiffResponseDTO[]>([]);
  const [third, setThird] = useState<DiffResponseDTO[]>([]);
  const [four, setFour] = useState<DiffResponseDTO[]>([]);

  // get Bolt
  const getBolt = (floor: number) => {
    axios.get('/api/bolt', {
      headers: {
        'floor': floor
      }
    })
      .then(r => {
        setBoltList(r.data);
      })
      .catch(function (error) {
        console.log('Error:', error);
      });
  };

  // get Diff
  const getDiff = (floor: number) => {
    axios.get('/api/diff', {
      headers: {
        'floor': floor
      }
    })
      .then(r => {
        setDiffList(r.data);
        setNumList(r.data.map((item:any) => item.num)); 
      })
      .catch(function (error) {
        console.log('Error:', error);
      });
  };

  useEffect(() => {
    getBolt(floor);
    getDiff(floor);
  }, [floor]);

  useEffect(() => {
    const firstData = diffList.slice(0, 24);
    const secoundData = diffList.slice(25, 49);
    const thirdData = diffList.slice(50, 74);
    const fourData = diffList.slice(75, diffList.length);

    setFirst(firstData);
    setSecound(secoundData);
    setThird(thirdData);
    setFour(fourData);
  }, [diffList]);

  const getSampledData = (data: BoltResponseDTO[]): BoltResponseDTO[] => {
    // num이 1인 데이터만 필터링
    const filteredData = data.filter(item => item.num === 1);

    // 날짜 기준으로 오름차순 정렬
    const sortedData = filteredData.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB; // 날짜가 이전인 것이 앞에 오도록 정렬
    });

    return sortedData;
  };

  const sampledBoltList = getSampledData(boltList);


  const chartData = {
    labels: sampledBoltList.map(item => item.date ? new Date(item.date).toLocaleDateString() : '...'),
    datasets: [
      {
        label: 'Distance',
        data: sampledBoltList.map(item => item.distance),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y-axis-1',
        spanGaps: true,
      },
      {
        label: 'Temperature',
        data: sampledBoltList.map(item => item.temperature),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y-axis-2',
        spanGaps: true,
      },
    ],
  };
  // 그래프 옵션 설정
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Floor ${floor} - Distance and Temperature`,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      'y-axis-1': {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Distance',
        },
      },
      'y-axis-2': {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Temperature',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const selectNum = (num: number) => {
    let displayedList: any = [];

    if (num < 8) {
      displayedList = [
        ...numList.slice(0, num + 7), // num 값만 포함
        '...',
        numList[numList.length - 1], // 마지막 요소의 num 값
      ];
    } else if (num >= 8 && num < numList.length - 7) {
      displayedList = [
        numList[0], // 첫 번째 요소의 num 값
        '...',
        ...numList.slice(num - 7, num + 7), // num 값만 포함
        '...',
        numList[numList.length - 1], // 마지막 요소의 num 값
      ];
    } else {
      displayedList = [
        numList[0], // 첫 번째 요소의 num 값
        '...',
        ...numList.slice(numList.length - 7), // num 값만 포함
      ];

    }
    // console.log(displayedList);
    return displayedList;
  };

  const displayedList = selectNum(num);

  return (
    <div className="flex flex-col items-center h-full w-full">
      <div className="w-full h-[5%] flex m-2">
        <button onClick={() => setFloor(1)}
          className={`text-blue-500 px-4 py-2 rounded hover:text-black ${floor === 1 ? 'text-black font-bold' : ''}`}>
          floor1
        </button>
        <button onClick={() => setFloor(2)}
          className={`text-blue-500 px-4 py-2 rounded hover:text-black ${floor === 2 ? 'text-black font-bold' : ''}`}>
          floor2
        </button>
        <button onClick={() => setFloor(3)}
          className={`text-blue-500 px-4 py-2 rounded hover:text-black ${floor === 3 ? 'text-black font-bold' : ''}`}>
          floor3
        </button>
      </div>
      <div className="w-full h-[5%] flex bg-blue-100 m-2">
        {displayedList.map((item: any, index: any) => (
          <button key={index} onClick={() => setNum(item)}
            className={`px-4 py-2 m-1 rounded bg-blue-100 hover:bg-blue-300 ${num === item ? 'bg-blue-300 font-bold' : ''}`}>
            {item}
          </button>
        ))}
      </div>
      <div className="w-full h-[60%] flex flex-col items-center justify-center">
        <Line data={chartData} options={options} />
      </div>
      {/* 테이블 표시 */}
      <div className="w-[100%] h-[30%] flex items-center justify-start ">
        <div className='w-[25%] h-[100%] space-y-4 overflow-y-auto'>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2">Num</th>
                <th className="border px-4 py-2">Ref</th>
                <th className="border px-4 py-2">Las</th>
                <th className="border px-4 py-2">Diff</th>
              </tr>
            </thead>
            <tbody>
              {first.length > 0 &&
                first.map((item) => (
                  <tr key={item.num}>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.num}</td>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.ref}</td>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.las}</td>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.diff}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className='w-[25%] h-[100%] space-y-4 overflow-auto '>
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2">Num</th>
                <th className="border px-4 py-2">Ref</th>
                <th className="border px-4 py-2">Las</th>
                <th className="border px-4 py-2">Diff</th>
              </tr>
            </thead>
            <tbody>
              {secound.length > 0 &&
                secound.map((item) => (
                  <tr key={item.num}>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.num}</td>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.ref}</td>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.las}</td>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.diff}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className='w-[25%] h-[100%] space-y-4 overflow-auto '>
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2">Num</th>
                <th className="border px-4 py-2">Ref</th>
                <th className="border px-4 py-2">Las</th>
                <th className="border px-4 py-2">Diff</th>
              </tr>
            </thead>
            <tbody>
              {third.length > 0 &&
                third.map((item) => (
                  <tr key={item.num}>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.num}</td>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.ref}</td>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.las}</td>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.diff}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className='w-[25%] h-[100%] space-y-4 overflow-auto '>
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2">Num</th>
                <th className="border px-4 py-2">Ref</th>
                <th className="border px-4 py-2">Las</th>
                <th className="border px-4 py-2">Diff</th>
              </tr>
            </thead>
            <tbody>
              {four.length > 0 &&
                four.map((item) => (
                  <tr key={item.num}>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.num}</td>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.ref}</td>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.las}</td>
                    <td className={`border px-4 py-2 ${num === item.num ? 'bg-red-300 font-bold' : ''}`}>{item.diff}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

      </div>
    </div >
  );
}