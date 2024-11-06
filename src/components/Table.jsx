import React from 'react'
import dayjs from 'dayjs'
import { secondToHour } from '../utils/index'
import { JIRA_ISSUE_PATH } from '../constants'

const Table = ({ headers, data }) => {
    return (
        <table className="divide-y divide-white-200">
            <thead className="bg-white text-black">
                <tr>
                    {headers.map((header, index) => (
                        <th className='border border-black' key={index}>{header.label}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {headers.map((header, colIndex) => {
                            let cellContent = header.keys.map(key => row[key]).find(value => value) || '';
                            let className = 'px-4 py-2 border border-white text-sm'

                            if (header.label === 'Log Work') {
                                const listTag = [];
                                for (const headerKey of header.keys) {
                                    const logWorkValue = row[headerKey];
                                    if (!logWorkValue || logWorkValue.trim() === '') continue;
                                    const match = logWorkValue.match(/(\d{2}\/\w{3}\/\d{2} \d{1,2}:\d{2} [APM]{2});.*?;(\d+)/);
                                    if (match) {
                                        const formattedDate = dayjs(match[1], 'DD/MMM/YY h:mm A').format('HH:mm DD-MM');
                                        listTag.push({ date: formattedDate, log: `${secondToHour(match[2])}h` });
                                    } else {
                                        listTag.push(logWorkValue);
                                    }
                                }
                                cellContent = <div className='flex flex-wrap gap-2'>
                                    {listTag.map((tag, index) => (<div key={index}>
                                        {typeof tag === "object"
                                            ? <div className='flex'>
                                                <div className='whitespace-nowrap px-1 w-22 bg-blue-600'>{tag.date}</div>
                                                <div className='whitespace-nowrap px-1 bg-red-600 rounded-r-lg'>{tag.log}</div>
                                            </div>
                                            : <span>{tag}</span>
                                        }
                                    </div>))}
                                </div>;
                            } else if (header.label === 'Status') {
                                if (["Done", "Resolved"].includes(cellContent)) {
                                    className += ' bg-green-600'
                                } else if (["In Progress", "To Do"].includes(cellContent)) {
                                    className += ' bg-yellow-600'
                                }
                            } else if (header.label === 'Issue key') {
                                const issueKey = cellContent;
                                if (issueKey) {
                                    cellContent = <a
                                        href={`${JIRA_ISSUE_PATH}/${issueKey}`}
                                        target='_blank'
                                        rel='noreferrer'
                                        className='underline cursor-pointer text-blue-600'
                                    >
                                        {issueKey}
                                    </a>
                                } else {
                                    cellContent = 'no issue key';
                                }
                            } else if (['Time Spent', 'Original Estimate'].includes(header.label)) {
                                cellContent = secondToHour(cellContent) + 'h';
                            }

                            return (
                                <td key={colIndex} className={className}>
                                    {cellContent}
                                </td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default Table