import React, { useMemo, useState } from 'react'
import Papa from 'papaparse'
import Table from './components/Table'
import { convertHeaders, generateChartConfigs, groupedCSVByAssignee, generateChartOverviewConfigs } from './utils'
import Plot from 'react-plotly.js';

const App = () => {
    const [allData, setAllData] = useState({
        headers: [],
        group: {}
    });
    const [assignees, setAssignees] = useState([]);
    const [selectedAssignee, setSelectedAssign] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file && file.type === 'text/csv') {
            Papa.parse(file, {
                header: true,
                separator: ',',
                quoteChar: '"',
                skipEmptyLines: true,
                complete: (result) => {
                    const newAllData = groupedCSVByAssignee(result);
                    const newAssignees = Object.keys(newAllData.group ?? {}).sort(
                        (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })
                    );
                    if (!newAllData.headers?.length || !newAssignees.length) {
                        alert('Convert CSV file failed. Please check the file format and try again.')
                        return;
                    };
                    setSelectedAssign(newAssignees[0]);
                    setAssignees(newAssignees);
                    setAllData(newAllData);
                },
            })
        } else {
            alert('Please upload a valid CSV file.')
        }
    }

    const csvData = useMemo(() => {
        const data = selectedAssignee ? allData.group[selectedAssignee] : allData.group[Object.keys(allData.group)[0]];

        if (!data) return { chart: {}, table: {} };
        return {
            chart: generateChartConfigs(convertHeaders(allData.headers), data, selectedAssignee),
            table: {
                headers: convertHeaders(allData.headers),
                data: data
            }
        };
    }, [allData, selectedAssignee]);

    const overviewChart = useMemo(() => {
        return generateChartOverviewConfigs(convertHeaders(allData.headers), allData);
    }, [allData]);

    return (
        <div className='p-4'>
            <h1 className='text-center text-4xl'>REPORT DATA</h1>
            <div className='my-4 text-center' >
                <a
                    className='text-center underline text-blue-500'
                    href="https://github.com/Duc-Developer/jr_reporter#readme"
                    target='_blank'>
                    Guide
                </a>
                <input className='ml-4' type="file" onChange={handleFileChange} />
            </div>
            {Object.keys(allData.group ?? {}).length
                ?
                <div className='relative'>
                    <select
                        className='absolute -top-12 right-36 px-4 py-2 bg-green-900 rounded z-1'
                        value={selectedAssignee}
                        onChange={(e) => {
                            if (!e.target.value) return;
                            setSelectedAssign(e.target.value);
                        }}
                    >
                        {assignees.map((assignee) => (
                            <option key={assignee} value={assignee}>
                                {assignee}
                            </option>
                        ))}
                    </select>
                    <button
                        className='mt-4 px-4 py-2 bg-blue-500 text-white rounded absolute -top-16 right-2 z-1'
                        onClick={() => setIsModalOpen(true)}
                    >
                        Show Table
                    </button>
                    <Plot
                        data={csvData.chart.data}
                        layout={csvData.chart.layout}
                        style={{ width: '100%', height: 600 }}
                        config={{ responsive: true, displayModeBar: false }}
                    />
                    <hr className='my-4' />
                    <Plot
                        data={overviewChart.data}
                        layout={overviewChart.layout}
                        style={{ width: '100%', height: 600 }}
                        config={{ responsive: true, displayModeBar: false }}
                    />
                </div>
                : <div className='text-center'>No data</div>
            }

            {isModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 w-screen h-screen'>
                    <div className='bg-[#242424] p-4 rounded shadow-lg w-[calc(100vw_-_100px)]  h-[calc(100vh_-_100px)] overflow-y-scroll'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-bold'>Table Data</h2>
                            <button
                                className='text-blue-500'
                                onClick={() => setIsModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                        <div className='p-4'>
                            <Table
                                headers={csvData.table.headers}
                                data={csvData.table.data}
                                selectedUser={selectedAssignee}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App