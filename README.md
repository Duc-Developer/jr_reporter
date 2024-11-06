# Jira Report

This project is a script to support reporting performance as a chart.

## Getting Started

### Prerequisites

Make sure you have the following installed on your system:

- Node.js
- npm or yarn

### Installation

1. Clone the repository:

```sh
git clone https://github.com/Duc-Developer/jira-report.git
cd jira-report
```

### Prepare assets

Open your issue in [jira.fpt.com](https://jira.fpt.com/home/issues)

1. For report log works - create query filter issue

```javascript
issuetype = <type> AND created >= <start_date> AND created <= <end_date> AND assignee = currentUser()
```

example:
```
issuetype = Sub-task AND created >= 2024-10-1 AND created <= 2024-10-31 AND assignee = currentUser()
```

export .csv file with option `CSV (All fields)` . Move to folder `/report_data` and rename it to `work_log.csv`

![example_screen_shot](/public/assets/example_1.png)

### On Windows

Double-click the `start_project.bat` file to start the project.

### On Linux

1. Make the start_project.sh script executable:

```sh
chmod +x start_project.sh
```

2. Run the `start_project.sh` script to start the project:

```sh
./start_project.sh
```


### Project Structure

```
your-project/
├── index.js
├── package.json
├── public/
│   ├── assets/
│   │   └── icon.png (or icon.ico)
│   ├── index.html
│   ├── script.js
│   └── mokdata.json
├── start_project.bat
├── start_project.sh
└── README.md
```

> [!NOTE]
> The project will automatically open Google Chrome at http://localhost:3006 when started.