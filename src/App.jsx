import React, { useMemo, useState } from 'react'
import Papa from 'papaparse'
import Table from './components/Table'
import { convertHeaders, generateChartConfigs } from './utils'
import Plot from 'react-plotly.js';

const App = () => {
    const [parsedCsv, setParsedCsv] = useState({
        headers: [],
        data: []
    })
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
                    setParsedCsv({
                        headers: result.meta.fields,
                        data: result.data
                    })
                },
            })
        } else {
            alert('Please upload a valid CSV file.')
        }
    }

    const chart = useMemo(() => {
        return generateChartConfigs(convertHeaders(parsedCsv.headers), parsedCsv.data);
    }, [parsedCsv]);

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
            {parsedCsv.data.length
                ?
                <div className='relative'>
                    <button
                        className='mt-4 px-4 py-2 bg-blue-500 text-white rounded absolute -top-16 right-2 z-1'
                        onClick={() => setIsModalOpen(true)}
                    >
                        Show Table
                    </button>
                    <Plot
                        data={chart.data}
                        layout={chart.layout}
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
                            <Table headers={convertHeaders(parsedCsv.headers)} data={parsedCsv.data} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App