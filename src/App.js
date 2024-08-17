import "./App.css";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

function App() {
  const [chartType, setChartType] = useState("bar");
  const [dataType, setDataType] = useState("sales");
  const [showChart, setShowChart] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectedCol, setSelectedCol] = useState(new Set(["categories"]));
  const [dummyData, setDummyData] = useState([]);
  const keys = ["categories", "actual", "target", "variance"];

  const handleChartChange = (type) => {
    setChartType(type);
    setShowChart(false);
    setSelectedCol(new Set(["categories"]));
  };

  const handleDataTypeChange = (e) => {
    setDataType(e.target.value);
    setShowChart(false);
  };

  const handleOkClick = () => {
    setShowChart(true);
  };

  const handleSelectAll = (e) => {
    const newSelectedItems = new Set(selectedItems);
    if (e.target.checked) {
      dummyData?.forEach((_, index) => {
        newSelectedItems.add(index);
      });
    } else {
      dummyData?.forEach((_, index) => {
        newSelectedItems.delete(index);
      });
    }
    setSelectedItems(newSelectedItems);
  };

  const handleSelectCol = (e, name) => {
    const newSelectedCol = new Set(selectedCol);
    if (chartType === "pie") {
      if (e.target.checked) {
        newSelectedCol.clear();
        newSelectedCol.add(name);
      } else {
        newSelectedCol.delete(name);
      }
    } else {
      if (e.target.checked) {
        newSelectedCol.add(name);
      } else {
        newSelectedCol.delete(name);
      }
    }
    setSelectedCol(newSelectedCol);
  };

  const handleCheckboxChange = (e, index) => {
    const newSelectedItems = new Set(selectedItems);
    if (e.target.checked) {
      newSelectedItems.add(index);
    } else {
      newSelectedItems.delete(index);
    }
    setSelectedItems(newSelectedItems);
  };

  const convertData = (data, chartType, selectedItems, selectedCol) => {
    const filteredData = {
      actual: data
        .filter((_, index) => selectedItems.has(index))
        .map((item) => item?.actual),
      target: data
        .filter((_, index) => selectedItems.has(index))
        .map((item) => item?.target),
      variance: data
        .filter((_, index) => selectedItems.has(index))
        .map((item) => item?.variance),
    };

    const series = [];
    if (selectedCol.has("actual")) {
      series.push({
        name: "Actual",
        data: filteredData.actual,
      });
    }
    if (selectedCol.has("target")) {
      series.push({
        name: "Target",
        data: filteredData.target,
      });
    }
    if (selectedCol.has("variance")) {
      series.push({
        name: "Variance",
        data: filteredData.variance,
      });
    }

    switch (chartType) {
      case "pie":
        return {
          series: series.length > 0 ? series[0].data : [],
          options: {
            chart: {
              type: "pie",
              width: "100%",
              height: "100%",
            },
            labels: data
              .filter((_, index) => selectedItems.has(index))
              ?.map((item) => item?.categories),
            theme: {
              monochrome: {
                enabled: true,
              },
            },
            plotOptions: {
              pie: {
                dataLabels: {
                  offset: -5,
                },
              },
            },
            dataLabels: {
              formatter(val, opts) {
                const name = opts.w.globals.labels[opts.seriesIndex];
                return [name, val.toFixed(1) + "%"];
              },
            },
            legend: {
              show: false,
            },
          },
        };
      case "line":
        return {
          series,
          options: {
            chart: {
              type: "area",
              height: 400,
            },
            xaxis: {
              categories: data
                .filter((_, index) => selectedItems.has(index))
                ?.map((item) => item?.categories),
            },
            dataLabels: {
              enabled: false,
            },
            stroke: {
              curve: "smooth",
            },
          },
        };
      case "bar":
      default:
        return {
          series,
          options: {
            chart: {
              type: "bar",
            },
            xaxis: {
              categories: data
                .filter((_, index) => selectedItems.has(index))
                ?.map((item) => item?.categories),
            },
          },
        };
    }
  };

  const chartData = convertData(
    dummyData,
    chartType,
    selectedItems,
    selectedCol
  );

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:8080/dash/employee");
      // let res = await fetch(
      //   "https://mocki.io/v1/1cb4e852-60a4-4b48-8c65-b21991310bb9"
      // );
      res = await res?.json();
      console.log(res?.data);
      setDummyData(res?.data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="main-container">
      <div className="left-container">
        <h3>Select Chart</h3>
        <div className="button-container">
          <button
            className={`button ${chartType === "bar" ? "active" : ""}`}
            onClick={() => handleChartChange("bar")}
          >
            Bar
          </button>
          <button
            className={`button ${chartType === "pie" ? "active" : ""}`}
            onClick={() => handleChartChange("pie")}
          >
            Pie
          </button>
          <button
            className={`button ${chartType === "line" ? "active" : ""}`}
            onClick={() => handleChartChange("line")}
          >
            Line
          </button>
        </div>
      </div>
      <div className="right-container">
        <div className="dropdown-container">
          <select className="data-dropdown" onChange={handleDataTypeChange}>
            <option value="sales">Sales Data</option>
          </select>
          <button className="button" onClick={handleOkClick}>
            OK
          </button>
        </div>
        <div className="chart-container">
          <div id="chart" className="chart">
            <h2>{dataType === "sales" ? "Sales Data" : "Call Data"}</h2>
            <div className="table">
              <table>
                <thead>
                  <tr>
                    <th>
                      <div>Select</div>
                      <input
                        type="checkbox"
                        onChange={(e) => handleSelectAll(e)}
                      />
                    </th>
                    {keys.map((item, key) => (
                      <th key={key}>
                        <div>{item}</div>
                        {/* Disable checkbox for categories */}
                        <input
                          name={item}
                          type="checkbox"
                          disabled={item === "categories"}
                          checked={selectedCol?.has(item)}
                          onChange={(e) => handleSelectCol(e, item)}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dummyData.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems?.has(index)}
                          onChange={(e) => handleCheckboxChange(e, index)}
                        />
                      </td>
                      <td>{item?.categories}</td>
                      <td>{item?.actual}</td>
                      <td>{item?.target}</td>
                      <td>{item?.variance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h2>
                {chartType === "bar"
                  ? "Bar Chart"
                  : chartType === "pie"
                  ? "Pie Chart"
                  : "Line Chart"}
              </h2>
              {showChart && (
                <ReactApexChart
                  type={chartType === "line" ? "area" : chartType}
                  height={400}
                  series={chartData.series}
                  options={chartData.options}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
