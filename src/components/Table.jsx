import React from 'react'
import dayjs from 'dayjs'
import { parseLogWorkInfo, secondToHour } from '../utils/index'
import { JIRA_ISSUE_PATH } from '../constants'

const Table = ({ headers, data, selectedUser, monthTarget }) => {
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
                                    const { logWorkAt, logWorkBy, seconds } = parseLogWorkInfo(logWorkValue);
                                    if (logWorkAt && logWorkBy && seconds) {
                                        const formattedDate = dayjs(logWorkAt, 'DD/MMM/YY h:mm A').format('HH:mm DD-MM');
                                        const logWorkMonth = dayjs(logWorkAt, 'DD/MMM/YY h:mm A').month();
                                        listTag.push({ date: formattedDate, log: `${secondToHour(seconds)}h`, logWorkBy, logWorkMonth });
                                    } else {
                                        listTag.push(logWorkValue);
                                    }
                                }
                                cellContent = <div className='flex flex-wrap gap-2'>
                                    {listTag.map((tag, index) => {
                                        const invalidUser = selectedUser && selectedUser.toLowerCase() !== tag.logWorkBy?.toLowerCase()
                                        const dateLog = monthTarget && Number(tag.logWorkMonth) !== Number(monthTarget)
                                        return <div key={index}>
                                            {typeof tag === "object"
                                                ? <div className={`flex ${invalidUser || dateLog
                                                    ? "line-through"
                                                    : ""}`}
                                                    title={tag.logWorkBy}
                                                >
                                                    <div className='whitespace-nowrap px-1 w-22 bg-blue-600'>{tag.date}</div>
                                                    <div className='whitespace-nowrap px-1 bg-red-600 rounded-r-lg'>{tag.log}</div>
                                                </div>
                                                : <p className='px-2 bg-gray-100 rounded text-black line-through'>{tag}</p>
                                            }
                                        </div>
                                    })}
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